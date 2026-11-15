import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { gerarPix } from "@/lib/fruitfy.functions";
import { PixPayment } from "@/components/PixPayment";
import copo from "@/assets/copo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Quiz } from "@/components/Quiz";
import { PRODUTO, FRETES, ADICIONAL, calcularTotal, reais, type FreteId } from "@/lib/pedido";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Resgate seu Copo Térmico UFC" },
    { name: "description", content: "Conclua o desafio e resgate seu copo. Escolha a entrega e confira o pedido antes de finalizar." },
    { property: "og:title", content: "Resgate seu Copo Térmico UFC" },
    { property: "og:description", content: "Seu copo do desafio por R$ 0,00. Você escolhe a entrega." },
    { property: "og:type", content: "product" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const etapas = ["Seus dados", "Entrega", "Pagamento"];

function Index() {
  const [frete, setFrete] = useState<FreteId>("pac");
  const [adicional, setAdicional] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const criarPix = useServerFn(gerarPix);
  const pagamento = useMutation({ mutationFn: criarPix, retry: false });
  const [quizFeito, setQuizFeito] = useState(false);
  const [dados, setDados] = useState({ nome: "", email: "", cpf: "", telefone: "", cep: "", estado: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "" });
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "found" | "not-found" | "error">("idle");
  const total = calcularTotal(frete, adicional);
  const freteSelecionado = FRETES.find((item) => item.id === frete) ?? FRETES[0];

  useEffect(() => {
    const cep = dados.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      setCepStatus("idle");
      return;
    }

    const controller = new AbortController();
    setCepStatus("loading");

    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Falha na consulta do CEP");
        return response.json();
      })
      .then((resultado) => {
        if (resultado.erro) {
          setCepStatus("not-found");
          return;
        }
        setDados((atual) => ({
          ...atual,
          estado: resultado.uf ?? "",
          endereco: resultado.logradouro ?? "",
          bairro: resultado.bairro ?? "",
          cidade: resultado.localidade ?? "",
        }));
        setCepStatus("found");
      })
      .catch((erro: unknown) => {
        if (erro instanceof Error && erro.name === "AbortError") return;
        setCepStatus("error");
      });

    return () => controller.abort();
  }, [dados.cep]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (etapa < 2) {
      setEtapa((atual) => atual + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (!pagamento.isPending) pagamento.mutate({ data: { nome: dados.nome, email: dados.email, cpf: dados.cpf, telefone: dados.telefone, frete, adicional,
      endereco: { cep: dados.cep, estado: dados.estado, endereco: dados.endereco, numero: dados.numero, complemento: dados.complemento, bairro: dados.bairro, cidade: dados.cidade } } });
  }

  if (!quizFeito) return <main className="flex min-h-screen items-center bg-background bg-hero"><section className="mx-auto w-full max-w-2xl px-5 py-12"><Quiz onFinish={() => setQuizFeito(true)} /></section></main>;

  return (
    <main className="min-h-screen bg-background bg-hero px-4 py-8 text-foreground sm:py-12">
      <section className="mx-auto w-full max-w-3xl">
        <header className="mb-7 text-center">
          <span className="font-display text-2xl font-black italic tracking-tight text-primary">UFC <span className="text-foreground">REWARDS</span></span>
          <h1 className="mt-3 font-display text-3xl font-black uppercase sm:text-4xl">Finalize seu resgate</h1>
          <p className="mt-2 text-sm text-muted-foreground">Seu desafio foi concluído. O copo principal já está liberado por R$ 0,00.</p>
        </header>

        <nav aria-label="Etapas do checkout" className="mb-7 grid grid-cols-3 gap-2">
          {etapas.map((nome, i) => <div key={nome} className={cn("flex items-center gap-2 border-b-2 px-1 pb-3 sm:px-3", i === etapa ? "border-primary text-primary" : i < etapa ? "border-primary/50 text-foreground" : "border-white/15 text-muted-foreground")}>
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold", i <= etapa ? "border-primary bg-primary text-white" : "border-white/20")}>{i < etapa ? "✓" : i + 1}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide sm:text-sm">{nome}</span>
          </div>)}
        </nav>

        {pagamento.data ? <PixPayment pagamento={pagamento.data} /> : <form onSubmit={onSubmit} className="space-y-5">
          {etapa === 0 && <section className="rounded-lg border border-white/10 bg-card p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Etapa 1 de 3</p>
            <h2 className="mt-1 font-display text-2xl font-black uppercase">Seus dados</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">Informe seus dados para identificar o pedido.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label htmlFor="nome">Nome completo</Label><Input id="nome" name="nome" autoComplete="name" placeholder="Digite seu nome completo" value={dados.nome} onChange={(e) => setDados((atual) => ({ ...atual, nome: e.target.value }))} required /></div>
              <div><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="email" placeholder="seu@email.com" value={dados.email} onChange={(e) => setDados((atual) => ({ ...atual, email: e.target.value }))} required /></div>
              <div><Label htmlFor="telefone">Celular / WhatsApp</Label><Input id="telefone" name="telefone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={dados.telefone} onChange={(e) => setDados((atual) => ({ ...atual, telefone: e.target.value }))} required /></div>
              <div><Label htmlFor="cpf">CPF</Label><Input id="cpf" name="cpf" inputMode="numeric" placeholder="00000000000" pattern="[0-9]{11}" maxLength={11} value={dados.cpf} onChange={(e) => setDados((atual) => ({ ...atual, cpf: e.target.value.replace(/\D/g, "") }))} required /></div>
            </div>
          </section>}

          {etapa === 1 && <section className="rounded-lg border border-white/10 bg-card p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Etapa 2 de 3</p>
            <h2 className="mt-1 font-display text-2xl font-black uppercase">Endereço de entrega</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">Informe onde deseja receber seu copo.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" name="cep" autoComplete="postal-code" inputMode="numeric" placeholder="00000-000" maxLength={9} pattern="[0-9]{5}-?[0-9]{3}" value={dados.cep} onChange={(e) => {
                  const numeros = e.target.value.replace(/\D/g, "").slice(0, 8);
                  const cep = numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
                  if (numeros !== dados.cep.replace(/\D/g, "")) {
                    setDados((atual) => ({ ...atual, cep, estado: "", endereco: "", bairro: "", cidade: "" }));
                    setFrete("pac");
                  } else {
                    setDados((atual) => ({ ...atual, cep }));
                  }
                }} required />
                <p aria-live="polite" className={cn("mt-2 text-xs", cepStatus === "found" ? "text-emerald-400" : cepStatus === "not-found" || cepStatus === "error" ? "text-amber-400" : "text-muted-foreground")}>
                  {cepStatus === "loading" ? "Buscando endereço pelo CEP…" : cepStatus === "found" ? "Endereço encontrado e preenchido automaticamente. Confira e informe o número." : cepStatus === "not-found" ? "CEP não encontrado. Confira os números ou preencha o endereço manualmente." : cepStatus === "error" ? "Não foi possível consultar agora. Você pode preencher o endereço manualmente." : "Digite os 8 números do CEP para preencher rua, bairro, cidade e estado automaticamente."}
                </p>
              </div>
              <div><Label htmlFor="estado">Estado (UF)</Label><Input id="estado" name="estado" autoComplete="address-level1" placeholder="Ex.: SP" maxLength={2} value={dados.estado} onChange={(e) => setDados((atual) => ({ ...atual, estado: e.target.value }))} required /></div>
              <div className="sm:col-span-2"><Label htmlFor="endereco">Rua / Avenida</Label><Input id="endereco" name="endereco" autoComplete="street-address" placeholder="Nome da rua ou avenida" value={dados.endereco} onChange={(e) => setDados((atual) => ({ ...atual, endereco: e.target.value }))} required /></div>
              <div><Label htmlFor="numero">Número</Label><Input id="numero" name="numero" placeholder="Nº" value={dados.numero} onChange={(e) => setDados((atual) => ({ ...atual, numero: e.target.value }))} required /></div>
              <div><Label htmlFor="complemento">Complemento (opcional)</Label><Input id="complemento" name="complemento" placeholder="Apartamento, bloco..." value={dados.complemento} onChange={(e) => setDados((atual) => ({ ...atual, complemento: e.target.value }))} /></div>
              <div><Label htmlFor="bairro">Bairro</Label><Input id="bairro" name="bairro" value={dados.bairro} onChange={(e) => setDados((atual) => ({ ...atual, bairro: e.target.value }))} required /></div>
              <div><Label htmlFor="cidade">Cidade</Label><Input id="cidade" name="cidade" autoComplete="address-level2" value={dados.cidade} onChange={(e) => setDados((atual) => ({ ...atual, cidade: e.target.value }))} required /></div>
            </div>
            <fieldset className="mt-7 space-y-3">
              <legend className="mb-3 text-sm font-bold uppercase tracking-wide">Escolha o frete</legend>
              {FRETES.map((item) => <label key={item.id} className={cn("flex cursor-pointer items-center justify-between gap-3 rounded-md border p-4 transition-colors", frete === item.id ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30")}>
                <span className="flex min-w-0 items-center gap-3">
                  <input type="radio" name="frete" value={item.id} checked={frete === item.id} onChange={() => setFrete(item.id)} className="h-4 w-4 shrink-0 accent-primary" />
                  {item.id === "sedex" ? (
                    <img
                      src="https://www.correios.com.br/enviar/precisa-de-ajuda/imagens/correios-de-a-a-z/simbolos-remessa-postal/icones_guia_sedex_preto.png/@@images/image"
                      alt="Logo oficial SEDEX dos Correios"
                      className="h-12 w-24 shrink-0 object-contain"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      referrerPolicy="strict-origin-when-cross-origin"
                      onError={(event) => { event.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <span aria-label="PAC" className="flex h-10 w-20 shrink-0 items-center justify-center font-sans text-xl font-black italic tracking-tight text-[#00529b]">PAC</span>
                  )}
                  <span className="min-w-0"><strong className="block text-sm">{item.nome}</strong><small className="text-xs text-muted-foreground">{item.prazo}</small></span>
                </span>
                <strong className="shrink-0 text-base">{reais(item.valor)}</strong>
              </label>)}
            </fieldset>
          </section>}

          {etapa === 2 && <section className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-card p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Etapa 3 de 3</p>
              <h2 className="mt-1 font-display text-2xl font-black uppercase">Resumo do pedido</h2>
              <p className="mt-1 text-sm text-muted-foreground">Confira os itens e o valor antes de continuar.</p>
              <div className="mt-5 flex items-center gap-4 border-b border-white/10 pb-5">
                <div className="flex h-24 w-20 shrink-0 items-center justify-center bg-black/40"><img src={copo} alt={PRODUTO.nome} width={1101} height={1428} loading="lazy" decoding="async" className="h-full w-full object-contain" /></div>
                <div className="min-w-0 flex-1"><strong className="block text-sm">{PRODUTO.nome}</strong><span className="mt-1 block text-xs text-muted-foreground">Prêmio liberado ao concluir o desafio</span><span className="mt-2 inline-block text-xs font-bold uppercase text-emerald-400">Grátis</span></div>
                <div className="text-right"><span className="block text-xs text-muted-foreground line-through">{reais(PRODUTO.valorOriginal)}</span><strong>{reais(PRODUTO.preco)}</strong></div>
              </div>

              <div className="mt-5 rounded-md border border-primary/50 bg-primary/5 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={adicional} onChange={(e) => setAdicional(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-black uppercase tracking-wide text-primary">Oferta especial — leve mais um!</span>
                    <strong className="mt-1 block text-sm">Adicionar outro Copo Térmico UFC 1,15L</strong>
                    <span className="mt-1 block text-xs text-muted-foreground">Leve uma segunda unidade junto com seu pedido.</span>
                    <span className="mt-2 flex flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground line-through">{reais(ADICIONAL.precoOriginal)}</span><strong className="text-lg text-primary">{reais(ADICIONAL.preco)}</strong><span className="rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase text-white">Oferta adicional</span></span>
                  </span>
                </label>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Copo do desafio</span><strong>{reais(0)}</strong></div>
                {adicional && <div className="flex justify-between gap-3"><span className="text-muted-foreground">Copo adicional</span><strong>{reais(ADICIONAL.preco)}</strong></div>}
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Entrega — {freteSelecionado.nome}</span><strong>{reais(freteSelecionado.valor)}</strong></div>
                <div className="flex justify-between gap-3 border-t border-white/10 pt-4 text-lg"><span className="font-bold">Total a pagar</span><strong className="text-primary">{reais(total)}</strong></div>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-card p-5 sm:p-6">
              <h3 className="font-display text-xl font-black uppercase">Pagamento</h3>
              <div className="mt-3 flex items-center gap-3 rounded-md border border-white/10 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded bg-primary/15 text-lg font-bold text-primary">PIX</span>
                <span><strong className="block text-sm">Pagamento via Pix</strong><small className="text-xs text-muted-foreground">QR Code e código Pix copia e cola.</small></span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">O copo principal custa R$ 0,00 por conta da conclusão do desafio. Você paga o frete escolhido e, somente se marcar a oferta, o copo adicional.</p>
            </div>
          </section>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {etapa > 0 ? <Button type="button" disabled={pagamento.isPending} variant="outline" size="lg" onClick={() => setEtapa((atual) => atual - 1)} className="sm:min-w-32">Voltar</Button> : <span />}
            <Button type="submit" disabled={pagamento.isPending} size="lg" className="w-full uppercase tracking-wider sm:w-auto sm:min-w-56">{pagamento.isPending ? "Gerando Pix…" : etapa === 2 ? `Gerar Pix · ${reais(total)}` : "Continuar"}</Button>
          </div>
          {pagamento.error && <p role="alert" className="text-sm text-destructive">{pagamento.error.message}</p>}
        </form>}
        <p className="mt-6 text-center text-[10px] text-muted-foreground">UFC Rewards · Confira os valores antes de confirmar.</p>
      </section>
    </main>
  );
}
