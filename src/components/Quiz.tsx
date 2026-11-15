import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QUIZ } from "@/lib/quiz";
import copo from "@/assets/copo.png";
import inox from "@/assets/quiz/copoexufc.png.asset.json";
import tampa from "@/assets/quiz/tampaufc.png.asset.json";
import alca from "@/assets/quiz/alcaufc.png.asset.json";

export interface QuizProps { onFinish: () => void }

const faq = [
  { q: "O COPO É GRÁTIS MESMO?", a: "Ao concluir as 9 perguntas, o copo fica disponível por R$ 0,00. Você paga somente o valor do envio, informado na próxima etapa antes de finalizar o pedido." },
  { q: "POR QUE VOCÊS DÃO O COPO?", a: "Esta é uma ação promocional para apresentar o Copo Térmico UFC 1,15L. A disponibilidade e as condições finais são mostradas na etapa de pedido." },
  { q: "TEM MENSALIDADE OU ASSINATURA?", a: "Não. Não existe mensalidade ou assinatura vinculada a esta oferta." },
  { q: "EM QUANTO TEMPO CHEGA?", a: "O prazo e o valor do frete são apresentados para você escolher na próxima etapa, antes de enviar o pedido." },
  { q: "POSSO RESGATAR MAIS DE UM?", a: "A oferta é destinada a um resgate por pessoa, sujeita à disponibilidade." },
  { q: "E SE EU NÃO GOSTAR?", a: "Confira as características do produto e as condições da oferta antes de confirmar seu pedido." },
];

const features = [
  { title: "24 HORAS DE GELO", desc: "Aço inox de parede dupla a vácuo para ajudar a manter sua bebida gelada por muito mais tempo.", img: inox.url, alt: "Detalhe do copo térmico em aço inox" },
  { title: "TAMPA COM CANUDO", desc: "Tampa do modelo com canudo, ideal para acompanhar sua rotina na academia, no trabalho ou no carro.", img: tampa.url, alt: "Tampa original do copo UFC com canudo" },
  { title: "CHAVEIRO NA ALÇA", desc: "Detalhe do chaveiro duplo preso à alça do copo.", img: alca.url, alt: "Alça original do copo UFC com chaveiro" },
  { title: "1,15 LITROS", desc: "Capacidade para o dia inteiro, com alça para carregar com uma mão.", img: copo, alt: "Copo Térmico UFC de 1,15 litro" },
];

export function Quiz({ onFinish }: QuizProps) {
  const [step, setStep] = useState(-1);
  const [selected, setSelected] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const q = QUIZ[step];
  const progress = step < 0 ? 0 : Math.round(((step + 1) / QUIZ.length) * 100);

  // Antecipar as imagens da próxima pergunta visual para evitar que apareçam atrasadas no celular.
  useEffect(() => {
    if (step < 0) return;
    const nextVisualQuestion = QUIZ.slice(step + 1).find((question) => question.options.some((option) => option.img));
    if (!nextVisualQuestion) return;
    const preloaded = nextVisualQuestion.options.flatMap((option) => {
      if (!option.img) return [];
      const image = new Image();
      image.decoding = "async";
      image.src = option.img;
      return [image];
    });
    return () => { preloaded.forEach((image) => { image.onload = null; image.onerror = null; }); };
  }, [step]);

  useEffect(() => {
    if (!selected) return;
    const timer = window.setTimeout(() => {
      if (step + 1 >= QUIZ.length) {
        setValidating(true);
      } else {
        setStep((current) => current + 1);
        setSelected(null);
      }
    }, 260);
    return () => window.clearTimeout(timer);
  }, [selected, step]);

  useEffect(() => {
    if (!validating) return;
    const timer = window.setTimeout(() => {
      setValidating(false);
      setShowResult(true);
    }, 2100);
    return () => window.clearTimeout(timer);
  }, [validating]);

  const start = () => {
    setSelected(null);
    setStep(0);
  };

  return (
    <section className="relative isolate mx-auto w-full max-w-5xl overflow-hidden px-3 pb-10 pt-4 text-center sm:px-6 sm:pt-5">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,rgba(145,0,12,0.34),transparent_72%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-primary shadow-[0_0_14px_rgba(220,0,18,0.8)]" />

      <header className="mx-auto flex w-full max-w-4xl items-center justify-between border-b border-white/10 px-1 pb-3 pt-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:text-[10px] sm:tracking-[0.24em]">
        <span className="font-display text-base italic tracking-tight text-primary sm:text-lg">UFC <span className="text-white/70">REWARDS</span></span>
        <nav className="flex items-center gap-3 sm:gap-7">
          <span className="hidden sm:inline">Desafio UFC</span>
          <span className="hidden sm:inline">Como funciona</span>
          <span className="text-primary">Resgate grátis</span>
        </nav>
        <span className="flex items-center gap-1.5 text-white/70"><span className="h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,.8)]" /> Acesso liberado</span>
      </header>

      {showResult ? (
        <div className="mx-auto max-w-3xl pb-14 pt-8 text-center sm:pt-12">
          <div className="mx-auto inline-flex items-center gap-2 border border-primary/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            <span aria-hidden>✦</span> Desafio completo
          </div>
          <h1 className="mx-auto mt-4 max-w-lg font-display text-4xl font-black uppercase leading-[1.02] text-white sm:text-4xl">
            Você ganhou
            <br />o copo UFC
            <br /><span className="text-primary">grátis</span>
          </h1>

          <div className="relative mx-auto mt-7 w-full max-w-[260px] border border-white/15 bg-[#090909] p-2 shadow-[5px_5px_0_0_rgba(220,0,18,0.9)] sm:max-w-[290px]">
            <div className="absolute -left-1 -top-1 z-10 bg-primary px-2 py-1 text-left text-[10px] font-black leading-tight text-white">
              <span className="block text-[8px] line-through opacity-75">R$ 197</span>R$ 0
            </div>
            <img src={copo} alt="Copo Térmico UFC 1,15L" width={1101} height={1428} fetchPriority="high" decoding="async" className="h-72 w-full object-contain sm:h-80" />
          </div>
          <h2 className="mt-6 font-display text-xl font-bold uppercase sm:text-2xl text-white">Copo Térmico UFC 1,15L</h2>
          <p className="mt-2 text-xs text-white/55 sm:text-sm">Aço inox de parede dupla + chaveiro duplo</p>

          <div className="mx-auto mt-7 grid max-w-lg grid-cols-3 gap-3">
            <div className="border border-white/10 bg-[#101010] px-3 py-4"><span className="block text-2xl text-primary">❄</span><b className="block text-xs text-white sm:text-sm">24 horas</b><span className="text-[11px] text-white/55 sm:text-xs">de gelo</span></div>
            <div className="border border-white/10 bg-[#101010] px-2 py-3"><span className="block text-lg text-primary">♨</span><b className="block text-[10px] text-white">1,15L</b><span className="text-[9px] text-white/45">de capacidade</span></div>
            <div className="border border-white/10 bg-[#101010] px-2 py-3"><span className="block text-lg text-primary">◉</span><b className="block text-[10px] text-white">Aço</b><span className="text-[9px] text-white/45">inox a vácuo</span></div>
          </div>

          <p className="mt-6 text-xs font-medium leading-relaxed text-white/65 sm:text-sm">Seu resgate está disponível. Na próxima etapa você verá o valor do envio antes de confirmar.</p>
          <Button size="lg" className="mt-5 h-14 w-full max-w-[340px] rounded-none bg-primary font-display text-base font-black uppercase tracking-wider text-white shadow-[4px_4px_0_0_rgba(120,0,0,.9)] hover:bg-primary/90" onClick={onFinish}>
            Resgatar meu copo <span aria-hidden className="ml-2">→</span>
          </Button>
          <p className="mt-4 text-[11px] text-white/50">◉ Envio rastreado <span className="mx-2 text-primary">•</span> ♧ Entrega em todo Brasil</p>

          <section className="mt-14 text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">É o que você ganhou</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[1.02] sm:text-4xl text-white">Não é brinde<br />de plástico.</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {features.map((item, i) => (
                <article key={item.title} className="overflow-hidden border border-white/10 bg-[#0b0b0b]">
                  <div className="flex h-32 items-center justify-center bg-[#111] sm:h-44">
                    <img src={item.img} alt={item.alt} width={480} height={320} loading="lazy" decoding="async" className="h-full w-full object-contain p-3 sm:p-4" />
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-xs font-black uppercase text-white sm:text-sm">{item.title}</h3>
                    <p className="mt-2 text-[11px] leading-relaxed text-white/55 sm:text-xs">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-12 text-left">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">Dúvidas do desafio</p>
            <h2 className="mt-2 font-display text-2xl font-black uppercase text-white">Antes de resgatar.</h2>
            <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {faq.map((item, i) => (
                <details key={item.q} open={i === 0} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs font-bold uppercase text-white sm:text-sm">
                    {item.q}<span className="text-sm text-primary group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 pr-5 text-xs leading-relaxed text-white/60 sm:text-sm">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="mt-10 border-t border-white/10 pt-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">Última chamada</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-tight sm:text-4xl text-white">Seu copo está<br /><span className="text-primary">reservado.</span></h2>
            <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-white/60 sm:text-sm">O produto sai por R$ 0,00. Você paga apenas a entrega rastreada até a sua casa.</p>
            <Button size="lg" className="mt-6 h-14 w-full max-w-[340px] rounded-none bg-primary font-display text-sm font-black uppercase tracking-wider text-white hover:bg-primary/90" onClick={onFinish}>
              Resgatar meu copo <span aria-hidden className="ml-2">→</span>
            </Button>
          </div>
        </div>
      ) : step < 0 && !validating ? (
        <div className="mx-auto flex min-h-[calc(100svh-130px)] max-w-2xl flex-col items-center justify-center py-10 sm:py-12">
          <span className="select-none font-display text-6xl font-black italic leading-none tracking-[-0.09em] text-primary sm:text-7xl">UFC</span>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.38em] text-primary sm:text-xs">Desafio exclusivo</p>
          <h1 className="mx-auto mt-3 max-w-lg font-display text-4xl font-bold uppercase leading-[0.98] tracking-wide text-foreground sm:text-5xl md:text-6xl">
            Responda tudo
            <br />e ganhe o copo
            <br /><span className="text-primary">grátis</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-white/55 sm:mt-5 sm:text-sm">
            Responda algumas perguntas rápidas e descubra como garantir seu Copo Térmico UFC 1,15L.
          </p>
          <div className="relative mx-auto mt-6 flex w-full max-w-[230px] items-center justify-center border border-primary/70 bg-[#090909] p-2 shadow-[8px_8px_0_0_rgba(220,0,18,0.85)] sm:mt-7 sm:max-w-[260px]">
            <img src={copo} alt="Copo Térmico UFC 1,15L" width={1101} height={1428} fetchPriority="high" className="h-56 w-full object-contain sm:h-64" />
            <span className="absolute bottom-2 right-2 bg-primary px-2 py-1 text-[9px] font-bold uppercase text-white">R$ 0,00</span>
          </div>
          <Button size="lg" className="mt-8 h-14 min-w-[270px] rounded-none bg-primary px-8 font-display text-lg font-bold uppercase tracking-wider text-primary-foreground shadow-[4px_4px_0_0_rgba(120,0,0,0.9)] hover:bg-primary/90 sm:h-14 sm:min-w-[275px]" onClick={start}>
            Começar o desafio <span aria-hidden className="ml-2">→</span>
          </Button>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">9 perguntas <span className="mx-2 text-primary">/</span> 1 minuto <span className="mx-2 text-primary">/</span> Copo UFC</p>
        </div>
      ) : validating ? (
        <div className="flex min-h-[calc(100svh-130px)] flex-col items-center justify-center py-16">
          <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-primary/50 bg-primary/10">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">Etapa final</p>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none text-white sm:text-5xl">Validando<br /><span className="text-primary">suas respostas</span></h2>
          <div className="mt-7 w-full max-w-xs space-y-3 text-left text-[11px] text-white/65">
            {["Conferindo suas respostas", "Verificando disponibilidade do prêmio", "Preparando seu resultado"].map((item) => (
              <div key={item} className="flex items-center gap-3"><span className="flex h-4 w-4 items-center justify-center bg-primary text-[9px] text-white">✓</span>{item}</div>
            ))}
          </div>
        </div>
      ) : q ? (
        <div className="mx-auto flex min-h-[calc(100svh-130px)] max-w-3xl flex-col items-center justify-center py-9 sm:py-14">
          <div className="mb-8 w-full max-w-2xl">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
              <span>Desafio UFC <span className="mx-2 text-primary">•</span> Pergunta {step + 1} de {QUIZ.length}</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="h-[3px] w-full bg-white/10"><div className="h-full bg-primary shadow-[0_0_10px_rgba(220,0,18,.7)] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="w-full max-w-2xl border-l-2 border-primary bg-[#090909]/95 px-5 py-7 text-left shadow-[0_12px_50px_rgba(0,0,0,.45)] sm:px-9 sm:py-9">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[2px] w-6 bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">{q.kicker}</span>
            </div>
            <h2 className="max-w-lg font-display text-2xl font-bold uppercase leading-[1.08] text-white sm:text-3xl md:text-4xl">{q.text}</h2>

            <div className={q.options.some((opt) => opt.img) ? "mt-7 grid grid-cols-2 gap-3 sm:gap-4" : "mt-7 grid grid-cols-1 gap-2.5"}>
              {q.options.map((opt, index) => {
                const active = selected === opt.label;
                return (
                  <button key={opt.label} type="button" disabled={!!selected} onClick={() => setSelected(opt.label)}
                    className={`group relative flex min-w-0 flex-col overflow-hidden border text-left transition-all duration-150 ${active ? "border-primary bg-primary/15 shadow-[0_0_18px_rgba(220,0,18,.2)]" : "border-white/10 bg-[#111] hover:border-primary/70 hover:bg-[#191919]"} ${opt.img ? "p-2 sm:p-3" : "min-h-14 flex-row items-center gap-3 px-4 py-4 sm:px-6 sm:py-5"}` }>
                    {opt.img && <span className="flex aspect-[4/3] min-h-[112px] w-full items-center justify-center overflow-hidden bg-[#151515] sm:min-h-[180px]"><img src={opt.img} alt={opt.label} width={480} height={360} loading="eager" decoding="async" fetchPriority="high" sizes="(max-width: 640px) 44vw, 280px" className="h-full w-full object-contain p-2 sm:p-3 transition-transform duration-300 group-hover:scale-[1.02]" /></span>}
                    <span className={`flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-white sm:text-base ${opt.img ? "px-1 pb-1 pt-2" : ""}`}>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center border text-[10px] ${active ? "border-primary bg-primary text-white" : "border-white/20 text-white/50"}`}>{active ? "✓" : String.fromCharCode(65 + index)}</span>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.15em] text-white/45">Selecione uma opção para continuar</p>
          </div>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">Suas respostas ajudam a personalizar sua experiência</p>
        </div>
      ) : null}
    </section>
  );
}
