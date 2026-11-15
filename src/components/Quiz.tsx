import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QUIZ } from "@/lib/quiz";
import copo from "@/assets/copo.png";

export interface QuizProps { onFinish: () => void }

/** Quiz de 9 perguntas. */
export function Quiz({ onFinish }: QuizProps) {
  const [step, setStep] = useState(-1);
  const q = QUIZ[step];

  if (step < 0 || !q) {
    return (
      <section className="relative isolate mx-auto w-full max-w-3xl overflow-hidden px-4 pb-8 pt-10 text-center sm:px-8 sm:pt-12">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-52 bg-[radial-gradient(ellipse_at_top,rgba(220,0,18,0.22),transparent_72%)]" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="mx-auto flex min-h-20 items-center justify-center">
          <span className="select-none font-display text-6xl font-black italic leading-none tracking-[-0.09em] text-primary sm:text-7xl">UFC</span>
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.38em] text-primary sm:text-xs">O desafio de hoje</p>
        <h1 className="mx-auto mt-3 max-w-xl font-display text-4xl font-bold uppercase leading-[0.98] tracking-wide text-foreground sm:text-5xl md:text-6xl">
          Responda tudo
          <br />
          e ganhe o copo
          <br />
          <span className="text-primary">grátis</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          9 perguntas rápidas sobre o seu dia. Chegou no fim, o Copo Térmico UFC 1,15L de R$ 197 sai por zero. O copo é seu.
        </p>

        <div className="relative mx-auto mt-7 flex w-full max-w-[230px] items-center justify-center border border-white/15 bg-[#111] p-3 shadow-[9px_9px_0_0_rgba(220,0,18,0.95)] sm:mt-8 sm:max-w-[250px]">
          <img src={copo} alt="Copo Térmico UFC 1,15L" width={1101} height={1428} fetchPriority="high" className="h-56 w-full object-contain sm:h-64" />
          <span className="absolute bottom-0 right-0 border-l border-t border-primary bg-primary px-3 py-2 text-sm font-extrabold text-primary-foreground">
            R$ 0,00
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button size="lg" className="h-14 min-w-[250px] rounded-none bg-primary px-8 font-display text-lg font-bold uppercase tracking-wider text-primary-foreground shadow-[4px_4px_0_0_rgba(120,0,0,0.9)] hover:bg-primary/90 sm:h-16 sm:min-w-[290px] sm:text-xl" onClick={() => setStep(0)}>
            Começar o desafio <span aria-hidden className="ml-2">→</span>
          </Button>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            9 perguntas <span className="mx-2 text-primary">/</span> 1 minuto <span className="mx-2 text-primary">/</span> Copo grátis
          </p>
        </div>
      </section>
    );
  }

  return (
    <div>
      <div className="mb-6 h-1 w-full rounded bg-muted" aria-hidden>
        <div className="h-1 rounded bg-primary transition-all" style={{ width: `${(step / QUIZ.length) * 100}%` }} />
      </div>
      <span className="text-sm uppercase tracking-widest text-primary">{step + 1}/{QUIZ.length} · {q.kicker}</span>
      <h2 className="mt-2 text-4xl text-foreground md:text-5xl">{q.text}</h2>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((opt) => (
          <Button key={opt.label} variant="outline" size="lg" className="h-auto flex-col items-stretch gap-2 p-3 text-left text-base"
            onClick={() => (step + 1 >= QUIZ.length ? onFinish() : setStep(step + 1))}>
            {opt.img && (
              <span className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-sm bg-muted/40 p-2">
                <img src={opt.img} alt={opt.label} loading="lazy" decoding="async" className="h-full w-full object-contain object-center" />
              </span>
            )}
            <span className="px-1 py-1">{opt.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
