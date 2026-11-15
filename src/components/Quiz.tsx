import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QUIZ } from "@/lib/quiz";
import copo from "@/assets/copo.png";

export interface QuizProps { onFinish: () => void }

export function Quiz({ onFinish }: QuizProps) {
  const [step, setStep] = useState(-1);
  const [selected, setSelected] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const q = QUIZ[step];
  const progress = step < 0 ? 0 : Math.round(((step + 1) / QUIZ.length) * 100);

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
    const timer = window.setTimeout(onFinish, 2100);
    return () => window.clearTimeout(timer);
  }, [validating, onFinish]);

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

      {step < 0 && !validating ? (
        <div className="mx-auto flex min-h-[calc(100svh-130px)] max-w-xl flex-col items-center justify-center py-8 sm:py-10">
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
          <div className="relative mx-auto mt-6 flex w-full max-w-[190px] items-center justify-center border border-primary/70 bg-[#090909] p-2 shadow-[8px_8px_0_0_rgba(220,0,18,0.85)] sm:mt-7 sm:max-w-[215px]">
            <img src={copo} alt="Copo Térmico UFC 1,15L" width={1101} height={1428} fetchPriority="high" className="h-48 w-full object-contain sm:h-56" />
            <span className="absolute bottom-2 right-2 bg-primary px-2 py-1 text-[9px] font-bold uppercase text-white">R$ 0,00</span>
          </div>
          <Button size="lg" className="mt-7 h-12 min-w-[245px] rounded-none bg-primary px-8 font-display text-lg font-bold uppercase tracking-wider text-primary-foreground shadow-[4px_4px_0_0_rgba(120,0,0,0.9)] hover:bg-primary/90 sm:h-14 sm:min-w-[275px]" onClick={start}>
            Começar o desafio <span aria-hidden className="ml-2">→</span>
          </Button>
          <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">9 perguntas <span className="mx-2 text-primary">/</span> 1 minuto <span className="mx-2 text-primary">/</span> Copo UFC</p>
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
        <div className="mx-auto flex min-h-[calc(100svh-130px)] max-w-2xl flex-col items-center justify-center py-8 sm:py-12">
          <div className="mb-7 w-full max-w-xl">
            <div className="mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-white/50">
              <span>Desafio UFC <span className="mx-2 text-primary">•</span> Pergunta {step + 1} de {QUIZ.length}</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="h-[3px] w-full bg-white/10"><div className="h-full bg-primary shadow-[0_0_10px_rgba(220,0,18,.7)] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="w-full max-w-xl border-l-2 border-primary bg-[#090909]/95 px-4 py-5 text-left shadow-[0_12px_50px_rgba(0,0,0,.45)] sm:px-7 sm:py-7">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-[2px] w-6 bg-primary" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-primary">{q.kicker}</span>
            </div>
            <h2 className="max-w-lg font-display text-2xl font-bold uppercase leading-[1.08] text-white sm:text-3xl md:text-4xl">{q.text}</h2>

            <div className={q.options.some((opt) => opt.img) ? "mt-6 grid grid-cols-2 gap-2.5 sm:gap-3" : "mt-6 grid grid-cols-1 gap-2"}>
              {q.options.map((opt, index) => {
                const active = selected === opt.label;
                return (
                  <button key={opt.label} type="button" disabled={!!selected} onClick={() => setSelected(opt.label)}
                    className={`group relative flex min-w-0 flex-col overflow-hidden border text-left transition-all duration-150 ${active ? "border-primary bg-primary/15 shadow-[0_0_18px_rgba(220,0,18,.2)]" : "border-white/10 bg-[#111] hover:border-primary/70 hover:bg-[#191919]"} ${opt.img ? "p-2" : "min-h-11 flex-row items-center gap-3 px-3 py-3 sm:px-4"}`}>
                    {opt.img && <span className="flex aspect-[5/3] w-full items-center justify-center overflow-hidden bg-black"><img src={opt.img} alt={opt.label} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /></span>}
                    <span className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white sm:text-sm ${opt.img ? "px-1 pb-1 pt-2" : ""}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center border text-[9px] ${active ? "border-primary bg-primary text-white" : "border-white/20 text-white/50"}`}>{active ? "✓" : String.fromCharCode(65 + index)}</span>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-[9px] uppercase tracking-[0.15em] text-white/35">Selecione uma opção para continuar</p>
          </div>
          <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/30">Suas respostas ajudam a personalizar sua experiência</p>
        </div>
      ) : null}
    </section>
  );
}
