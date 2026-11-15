import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QUIZ } from "@/lib/quiz";

export interface QuizProps { onFinish: () => void }

/** Quiz de 9 perguntas. Ao terminar, apenas mostra o produto — sem prêmio. */
export function Quiz({ onFinish }: QuizProps) {
  const [step, setStep] = useState(-1);
  const q = QUIZ[step];

  if (step < 0 || !q) {
    return (
      <div className="text-center">
        <span className="text-sm uppercase tracking-widest text-primary">Quiz rápido</span>
        <h1 className="mt-2 text-5xl leading-none text-foreground md:text-7xl">Descubra o copo do seu dia</h1>
        <p className="mt-4 text-muted-foreground">9 perguntas, 1 minuto.</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button size="lg" className="uppercase tracking-wider" onClick={() => setStep(0)}>Começar o quiz</Button>
          <button type="button" onClick={onFinish} className="text-sm text-muted-foreground underline">Pular e ver o copo</button>
        </div>
      </div>
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
          <Button key={opt} variant="outline" size="lg" className="h-auto justify-start py-4 text-left text-base"
            onClick={() => (step + 1 >= QUIZ.length ? onFinish() : setStep(step + 1))}>
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
}
