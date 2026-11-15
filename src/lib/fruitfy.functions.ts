import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { pixInputSchema, montarCobranca, extrairCodigoPix, extrairOrderUuid, FRUITFY_CHARGE_URL, type PixCharge } from "./fruitfy";

export const gerarPix = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pixInputSchema.parse(input))
  .handler(async ({ data }): Promise<PixCharge> => {
    const { checkoutSession, fruitfyHeaders } = await import("./fruitfy.server");
    const session = checkoutSession(true);
    const headers = fruitfyHeaders();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Prevent repeated clicks/retries from silently creating another charge.
    const { data: recent, error: recentError } = await supabaseAdmin.from("fruitfy_orders")
      .select("id").eq("session_id", session).neq("status", "failed")
      .limit(1);
    if (recentError) throw new Error("Não foi possível verificar seus pedidos anteriores.");
    if (recent?.length) throw new Error("Já existe uma tentativa nesta sessão. Confira a cobrança na Fruitfy antes de gerar outra.");
    const body = montarCobranca(data);
    const { data: order, error } = await supabaseAdmin.from("fruitfy_orders").insert({
      session_id: session, amount: body.amount,
      customer: { nome: data.nome, email: data.email, cpf: data.cpf, telefone: data.telefone },
      address: data.endereco, shipping: data.frete, additional: data.adicional,
    }).select("id").single();
    if (error || !order) throw new Error("Não foi possível salvar o pedido. Nenhuma cobrança foi solicitada.");
    const response = await fetch(FRUITFY_CHARGE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: body.name, email: body.email, cpf: body.cpf, phone: body.phone, items: body.items }),
      signal: AbortSignal.timeout(30000),
    });
    // Do not log response bodies: payment providers can echo customer information or credentials.
    if (!response.ok) {
      await supabaseAdmin.from("fruitfy_orders").update({ status: "failed" }).eq("id", order.id);
      throw new Error(`A Fruitfy recusou a cobrança (HTTP ${response.status}). Confira os dados e a configuração da conta.`);
    }
    const result: unknown = await response.json();
    const codigo = extrairCodigoPix(result);
    const uuid = extrairOrderUuid(result);
    if (!codigo || !uuid) throw new Error("A Fruitfy não retornou código Pix e identificação válidos. Confira a cobrança no painel antes de tentar novamente.");
    const { error: saveError } = await supabaseAdmin.from("fruitfy_orders").update({
      provider_order_id: uuid, pix_code: codigo, status: "waiting_payment",
    }).eq("id", order.id);
    if (saveError) throw new Error("A cobrança foi criada, mas não pôde ser vinculada ao pedido. Confira o painel Fruitfy.");
    return { codigo, total: body.amount / 100, pedidoId: order.id };
  });

export const consultarPagamento = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ pedidoId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { checkoutSession, atualizarConfirmacao } = await import("./fruitfy.server");
    const session = checkoutSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("fruitfy_orders")
      .select("id, provider_order_id, amount, status, checked_at").eq("id", data.pedidoId)
      .eq("session_id", session).is("deleted_at", null).single();
    if (error || !order?.provider_order_id) throw new Error("Pedido não encontrado nesta sessão.");
    if (order.checked_at && Date.now() - Date.parse(order.checked_at) < 15000) return { status: order.status };
    return atualizarConfirmacao(order.id, order.provider_order_id, order.amount);
  });