import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { FRUITFY_STORE_ID, validarPedidoProvider } from "./fruitfy";

/** Guest ownership lives in an HttpOnly cookie, never in a public order identifier. */
export function checkoutSession(create = false): string {
  const existing = z.string().uuid().safeParse(getCookie("checkout_session"));
  if (existing.success) return existing.data;
  if (!create) throw new Error("Sua sessão de pedido expirou.");
  const session = crypto.randomUUID();
  setCookie("checkout_session", session, {
    httpOnly: true, sameSite: "lax", secure: process.env["NODE_ENV"] === "production",
    path: "/", maxAge: 60 * 60 * 24,
  });
  return session;
}

export function fruitfyHeaders(): HeadersInit {
  const token = process.env["FRUITFY_API_TOKEN"];
  if (!token) throw new Error("O token da Fruitfy não está configurado.");
  return { Authorization: `Bearer ${token}`, "Store-Id": FRUITFY_STORE_ID,
    "Content-Type": "application/json", Accept: "application/json" };
}

/** Webhook contents never establish status: the authenticated provider lookup does. */
export async function confirmarPedido(uuid: string, amount: number) {
  const response = await fetch(`https://api.fruitfy.io/api/order/${encodeURIComponent(uuid)}`, {
    headers: fruitfyHeaders(), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Não foi possível consultar o pagamento na Fruitfy.");
  return validarPedidoProvider(await response.json(), uuid, amount);
}

export async function atualizarConfirmacao(id: string, uuid: string, amount: number) {
  const verified = await confirmarPedido(uuid, amount);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("fruitfy_orders").update({
    status: verified.status, paid_at: verified.paid_at,
    checked_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", id).eq("provider_order_id", uuid);
  if (error) throw new Error("Não foi possível atualizar a confirmação do pedido.");
  return { status: verified.status };
}