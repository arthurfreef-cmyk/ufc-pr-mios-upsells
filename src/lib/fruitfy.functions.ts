import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { pixInputSchema, montarCobranca, extrairCodigoPix, extrairOrderUuid, FRUITFY_CHARGE_URL, type PixCharge } from "./fruitfy";

const KIT_PRICE_CENTS = 3490;
const CUP_PRODUCT_ID = "a335fce2-9eb3-48c4-9743-9a4220296ce6";

export const gerarPix = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pixInputSchema.parse(input))
  .handler(async ({ data }): Promise<PixCharge> => {
    const { checkoutSession, fruitfyHeaders } = await import("./fruitfy.server");
    const session = checkoutSession(true);
    const headers = fruitfyHeaders();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: recent, error: recentError } = await supabaseAdmin.from("fruitfy_orders")
      .select("id").eq("session_id", session).is("parent_order_id", null).neq("status", "failed")
      .limit(1);
    if (recentError) throw new Error("Não foi possível verificar seus pedidos anteriores.");
    if (recent?.length) throw new Error("Já existe uma tentativa nesta sessão. Confira a cobrança existente antes de gerar outra.");
    const body = montarCobranca(data);
    const { data: order, error } = await supabaseAdmin.from("fruitfy_orders").insert({
      session_id: session, amount: body.amount,
      customer: { nome: data.nome, email: data.email, cpf: data.cpf, telefone: data.telefone },
      address: data.endereco, shipping: data.frete, additional: data.adicional,
    }).select("id").single();
    if (error || !order) throw new Error("Não foi possível salvar o pedido. Nenhuma cobrança foi solicitada.");
    const response = await fetch(FRUITFY_CHARGE_URL, {
      method: "POST", headers,
      body: JSON.stringify({ name: body.name, email: body.email, cpf: body.cpf, phone: body.phone, items: body.items }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      await supabaseAdmin.from("fruitfy_orders").update({ status: "failed" }).eq("id", order.id);
      throw new Error(`O serviço de pagamento recusou a cobrança (HTTP ${response.status}). Confira os dados e a configuração da conta.`);
    }
    const result: unknown = await response.json();
    const codigo = extrairCodigoPix(result);
    const uuid = extrairOrderUuid(result);
    if (!codigo || !uuid) throw new Error("Não foi possível obter os dados válidos do Pix. Confira a cobrança no painel antes de tentar novamente.");
    const { error: saveError } = await supabaseAdmin.from("fruitfy_orders").update({
      provider_order_id: uuid, pix_code: codigo, status: "waiting_payment",
    }).eq("id", order.id);
    if (saveError) throw new Error("A cobrança foi criada, mas não pôde ser vinculada ao pedido. Confira o painel de pagamentos.");
    return { codigo, total: body.amount / 100, pedidoId: order.id };
  });

export const consultarOfertaKit = createServerFn({ method: "GET" })
  .handler(async () => {
    const { checkoutSession } = await import("./fruitfy.server");
    const session = checkoutSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: parent, error } = await supabaseAdmin.from("fruitfy_orders")
      .select("id").eq("session_id", session).is("parent_order_id", null)
      .is("deleted_at", null).eq("status", "paid")
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error || !parent) return { eligible: false as const };
    const { data: existing, error: childError } = await supabaseAdmin.from("fruitfy_orders")
      .select("id, amount, status, pix_code").eq("parent_order_id", parent.id)
      .eq("offer_id", "kit").neq("status", "failed").limit(1).maybeSingle();
    if (childError) throw new Error("Não foi possível consultar a oferta.");
    if (existing?.status === "paid") return { eligible: true as const, parentOrderId: parent.id, alreadyPaid: true as const };
    const charge = existing?.pix_code
      ? { codigo: existing.pix_code, total: existing.amount / 100, pedidoId: existing.id }
      : null;
    return { eligible: true as const, parentOrderId: parent.id, alreadyPaid: false as const, charge };
  });

export const gerarPixKit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ parentOrderId: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<PixCharge> => {
    const { checkoutSession, fruitfyHeaders } = await import("./fruitfy.server");
    const session = checkoutSession();
    const headers = fruitfyHeaders();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: parent, error: parentError } = await supabaseAdmin.from("fruitfy_orders")
      .select("id, customer, address, shipping, status")
      .eq("id", data.parentOrderId).eq("session_id", session)
      .is("parent_order_id", null).is("deleted_at", null).eq("status", "paid").single();
    if (parentError || !parent) throw new Error("A oferta só pode ser liberada após a confirmação do pagamento principal.");
    const { data: existing, error: existingError } = await supabaseAdmin.from("fruitfy_orders")
      .select("id, amount, status, pix_code").eq("parent_order_id", parent.id)
      .eq("offer_id", "kit").neq("status", "failed").limit(1).maybeSingle();
    if (existingError) throw new Error("Não foi possível verificar a cobrança da oferta.");
    if (existing?.status === "paid") throw new Error("Esta oferta já foi paga.");
    if (existing?.pix_code) return { codigo: existing.pix_code, total: existing.amount / 100, pedidoId: existing.id };

    const customer = parent.customer as { nome: string; email: string; cpf: string; telefone: string };
    const phone = customer.telefone.replace(/\D/g, "");
    const { data: order, error: insertError } = await supabaseAdmin.from("fruitfy_orders").insert({
      session_id: session, parent_order_id: parent.id, offer_id: "kit",
      amount: KIT_PRICE_CENTS, customer: parent.customer, address: parent.address,
      shipping: parent.shipping, additional: false,
    }).select("id").single();
    if (insertError || !order) throw new Error("Não foi possível registrar a oferta. Nenhuma cobrança foi solicitada.");

    const response = await fetch(FRUITFY_CHARGE_URL, {
      method: "POST", headers,
      body: JSON.stringify({
        name: customer.nome, email: customer.email, cpf: customer.cpf,
        phone: phone.length <= 11 ? `55${phone}` : phone,
        items: [{ id: CUP_PRODUCT_ID, value: KIT_PRICE_CENTS / 2, quantity: 2 }],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      await supabaseAdmin.from("fruitfy_orders").update({ status: "failed" }).eq("id", order.id);
      throw new Error(`O serviço de pagamento recusou a oferta (HTTP ${response.status}).`);
    }
    const result: unknown = await response.json();
    const codigo = extrairCodigoPix(result);
    const uuid = extrairOrderUuid(result);
    if (!codigo || !uuid) {
      await supabaseAdmin.from("fruitfy_orders").update({ status: "failed" }).eq("id", order.id);
      throw new Error("Não foi possível obter os dados válidos do Pix da oferta.");
    }
    const { error: saveError } = await supabaseAdmin.from("fruitfy_orders").update({
      provider_order_id: uuid, pix_code: codigo, status: "waiting_payment",
    }).eq("id", order.id);
    if (saveError) throw new Error("A cobrança foi criada, mas não pôde ser vinculada à oferta. Confira o painel de pagamentos.");
    return { codigo, total: KIT_PRICE_CENTS / 100, pedidoId: order.id };
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