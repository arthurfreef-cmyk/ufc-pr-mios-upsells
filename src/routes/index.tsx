import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import copo from "@/assets/copo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PRODUTO, FRETES, ADICIONAL, calcularTotal, reais } from "@/lib/pedido";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Copo Térmico 1,15L — Compre com preço claro" },
      { name: "description", content: "Copo térmico de aço inox 1,15L. Preço, frete e adicional mostrados antes do pagamento." },
      { property: "og:title", content: "Copo Térmico 1,15L" },
      { property: "og:description", content: "Preço, frete e adicional mostrados antes do pagamento." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [frete, setFrete] = useState(FRETES[0].id);
  const [adicional, setAdicional] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const total = calcularTotal(frete, adicional);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviado(true);
  }

  return (
    <main className="min-h-screen bg-background bg-hero">
      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
        <div className="flex flex-col justify-center">
          <span className="text-sm uppercase tracking-widest text-primary">Lançamento</span>
          <h1 className="mt-2 text-6xl leading-none text-foreground md:text-7xl">{PRODUTO.nome}</h1>
          <p className="mt-4 text-muted-foreground">{PRODUTO.descricao}</p>
          <p className="mt-6 text-5xl font-semibold text-foreground">{reais(PRODUTO.preco)}</p>
          <p className="text-sm text-muted-foreground">+ frete, escolhido abaixo</p>
        </div>
        <img src={copo} alt={PRODUTO.nome} width={1101} height={1428} className="mx-auto max-h-[480px] w-auto rounded-md object-contain" />
      </section>

      <section className="mx-auto max-w-xl px-5 pb-20">
        {enviado ? (
          <div className="rounded-md border border-border bg-card p-6 text-center">
            <h2 className="text-4xl text-foreground">Pedido registrado</h2>
            <p className="mt-2 text-muted-foreground">Total: {reais(total)}. O pagamento por Pix ainda será conectado.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6 rounded-md border border-border bg-card p-6">
            <h2 className="text-4xl text-foreground">Seu pedido</h2>
            <div className="grid gap-4">
              <div><Label htmlFor="nome">Nome</Label><Input id="nome" required /></div>
              <div><Label htmlFor="cep">CEP</Label><Input id="cep" required inputMode="numeric" /></div>
              <div><Label htmlFor="end">Endereço</Label><Input id="end" required /></div>
            </div>
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm text-muted-foreground">Frete</legend>
              {FRETES.map((f) => (
                <label key={f.id} className={cn("flex cursor-pointer items-center justify-between rounded-md border p-3", frete === f.id ? "border-primary" : "border-border")}>
                  <span className="flex items-center gap-2">
                    <input type="radio" name="frete" checked={frete === f.id} onChange={() => setFrete(f.id)} className="accent-primary" />
                    {f.nome} <small className="text-muted-foreground">{f.prazo}</small>
                  </span>
                  <span>{reais(f.valor)}</span>
                </label>
              ))}
            </fieldset>
            <label className="flex cursor-pointer items-center justify-between rounded-md border border-border p-3">
              <span className="flex items-center gap-2">
                <input type="checkbox" checked={adicional} onChange={(e) => setAdicional(e.target.checked)} className="accent-primary" />
                Adicionar {ADICIONAL.nome} (opcional)
              </span>
              <span>+ {reais(ADICIONAL.preco)}</span>
            </label>
            <div className="flex items-center justify-between border-t border-border pt-4 text-lg">
              <span>Total</span><b>{reais(total)}</b>
            </div>
            <Button type="submit" size="lg" className="w-full uppercase tracking-wider">Finalizar pedido de {reais(total)}</Button>
          </form>
        )}
      </section>
    </main>
  );
}
