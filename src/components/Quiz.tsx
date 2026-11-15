import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QUIZ } from "@/lib/quiz";
import { PRODUTO, reais } from "@/lib/pedido";
import copo from "@/assets/copo.png";

export interface QuizProps { onFinish: () => void }

/** Quiz de 9 perguntas. Ao terminar, apenas mostra o produto — sem prêmio. */
export function Quiz({ onFinish }: QuizProps) {
  const [step, setStep] = useState(-1);
  const q = QUIZ[step];

  if (step < 0 || !q) {
    return (
      <div className="text-center">
        <span className="text-sm uppercase tracking-widest text-primary">O desafio de hoje</span>
        <h1 className="mt-2 text-6xl leading-none text-foreground md:text-7xl">
          Responda tudo e conheça o <span className="text-primary">copo</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          9 perguntas rápidas sobre o seu dia. No fim, você vê o Copo Térmico 1,15L com preço e frete claros.
        </p>
        <img src={copo} alt="Copo Térmico 1,15L" width={1101} height={1428} className="mx-auto mt-8 max-h-80 w-auto object-contain" />
        <p className="mt-4 text-4xl font-semibold text-foreground">{reais(PRODUTO.preco)}</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button size="lg" className="uppercase tracking-wider" onClick={() => setStep(0)}>Começar o desafio</Button>
          <p className="text-sm text-muted-foreground">9 perguntas / 1 minuto</p>
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
          <Button key={opt.label} variant="outline" size="lg" className="h-auto flex-col items-stretch gap-2 p-3 text-left text-base"
            onClick={() => (step + 1 >= QUIZ.length ? onFinish() : setStep(step + 1))}>
            {opt.img && <img src={opt.img} alt={opt.label} className="aspect-[4/3] w-full rounded-sm object-cover" />}
            <span className="px-1 py-1">{opt.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
