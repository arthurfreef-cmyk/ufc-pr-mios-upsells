import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FRUITFY_STORE_ID } from "@/lib/fruitfy";

const notificationSchema = z.object({
  event: z.enum(["order_paid", "order_waiting_payment", "order_canceled", "order_refunded"]),
  webhook_id: z.string().uuid(),
  store: z.object({ id: z.literal(FRUITFY_STORE_ID) }),
  order: z.object({ id: z.string().uuid() }),
});

export const Route = createFileRoute("/api/public/fruitfy-webhook")({
  server: { handlers: { POST: async ({ request }) => {
    if (Number(request.headers.get("content-length") ?? 0) > 65536) return new Response(null, { status: 413 });
    let payload: z.infer<typeof notificationSchema>;
    try {
      const raw = await request.text();
      if (raw.length > 65536) return new Response(null, { status: 413 });
      payload = notificationSchema.parse(JSON.parse(raw));
    } catch { return Response.json({ received: false }, { status: 400 }); }
    // This unsigned event is only a lookup hint. No callback-provided status or amount is trusted.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("fruitfy_orders")
      .select("id, amount, checked_at").eq("provider_order_id", payload.order.id).is("deleted_at", null).maybeSingle();
    if (error) return new Response(null, { status: 503 });
    if (!order) return Response.json({ received: true });
    if (order.checked_at && Date.now() - Date.parse(order.checked_at) < 15000) return new Response(null, { status: 503 });
    try {
      const { atualizarConfirmacao } = await import("@/lib/fruitfy.server");
      await atualizarConfirmacao(order.id, payload.order.id, order.amount);
      return Response.json({ received: true });
    } catch { return Response.json({ received: false }, { status: 503 }); }
  } } },
});