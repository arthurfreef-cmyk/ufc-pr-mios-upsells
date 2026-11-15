import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/obrigado")({
  head: () => ({ meta: [
    { title: "Pedido confirmado — UFC Rewards" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: Obrigado,
});

function Obrigado() {
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground">
    <section className="w-full max-w-lg border border-white/10 bg-card p-8 text-center sm:p-10">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-primary">UFC Rewards</p>
      <h1 className="mt-3 font-display text-4xl font-black uppercase">Obrigado!</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Sua etapa de compra foi concluída. O pedido principal permanece confirmado e qualquer oferta adicional é opcional.</p>
    </section>
  </main>;
}