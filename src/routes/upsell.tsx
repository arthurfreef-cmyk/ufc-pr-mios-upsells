import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PixPayment } from "@/components/PixPayment";
import copo from "@/assets/copo.png";
import { consultarOfertaKit, gerarPixKit } from "@/lib/fruitfy.functions";

export const Route = createFileRoute("/upsell")({
  head: () => ({ meta: [
    { title: "Oferta especial — Kit UFC" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: KitUpsell,
});

function KitUpsell() {
  const consultarOferta = useServerFn(consultarOfertaKit);
  const criarPix = useServerFn(gerarPixKit);
  const oferta = useQuery({ queryKey: ["oferta-kit"], queryFn: () => consultarOferta(), retry: false });
  const pagamento = useMutation({ mutationFn: criarPix, retry: false });

  useEffect(() => {
    if (oferta.data?.alreadyPaid) window.location.replace("/obrigado");
  }, [oferta.data?.alreadyPaid]);

  if (oferta.isLoading) return <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center"><p className="text-sm text-muted-foreground">Verificando sua oferta…</p></main>;
  if (oferta.error || !oferta.data?.eligible) return <main className="flex min-h-screen items-center justify-center bg-background px-5"><section className="max-w-md space-y-4 text-center"><h1 className="font-display text-3xl font-black uppercase">Oferta indisponível</h1><p className="text-sm text-muted-foreground">Esta oferta é liberada somente após a confirmação do pedido principal.</p><Button onClick={() => window.location.replace("/")}>Voltar à página inicial</Button></section></main>;

  if (oferta.data.alreadyPaid) return <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center"><p className="text-sm text-muted-foreground">Oferta já concluída. Redirecionando…</p></main>;

  const charge = pagamento.data ?? oferta.data.charge;
  return <main className="min-h-screen bg-background bg-hero px-4 py-8 text-foreground sm:py-12">
    <section className="mx-auto w-full max-w-2xl">
      <header className="mb-6 text-center"><span className="font-display text-2xl font-black italic text-primary">UFC <span className="text-foreground">REWARDS</span></span><p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">Oferta exclusiva após sua compra</p><h1 className="mt-3 font-display text-3xl font-black uppercase leading-tight sm:text-5xl">Espere! Temos uma oferta especial para você</h1><p className="mt-3 text-sm text-muted-foreground">Adicione mais um copo e leve o kit com 2 unidades por um preço especial.</p></header>
      <div className="border border-white/10 bg-card p-5 sm:p-7">
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
          {[0, 1].map((item) => <div key={item} className="flex h-52 items-center justify-center bg-black/30 p-2"><img src={copo} alt="Copo térmico UFC 1,15L" width={220} height={285} loading="eager" decoding="async" fetchPriority="high" className="h-full w-full object-contain" /></div>)}
        </div>
        <p className="mt-5 text-center text-xs font-bold uppercase tracking-wider text-primary">Kit especial com 2 copos térmicos UFC</p>
        <div className="mt-3 text-center"><p className="font-display text-5xl font-black text-primary">R$ 34,90</p><p className="mt-1 text-xs text-muted-foreground">Pagamento separado via Pix, somente se aceitar.</p></div>
        {charge ? <div className="mt-6"><PixPayment pagamento={charge} successUrl="/obrigado" /></div> : <div className="mt-6 space-y-3">
          <Button className="h-12 w-full text-base font-black uppercase" disabled={pagamento.isPending} onClick={() => pagamento.mutate({ data: { parentOrderId: oferta.data.parentOrderId } })}>{pagamento.isPending ? "Preparando Pix…" : "Quero aproveitar o kit por R$ 34,90"}</Button>
          {pagamento.error && <p role="alert" className="text-sm text-destructive">{pagamento.error.message}</p>}
          <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => window.location.replace("/obrigado")}>Não, obrigado. Continuar sem o kit.</Button>
        </div>}
      </div>
      <p className="mt-5 text-center text-[10px] text-muted-foreground">Oferta opcional. Recusar não altera seu pedido já confirmado.</p>
    </section>
  </main>;
}