/** Valores exibidos na página. Ajuste aqui quando os preços reais forem confirmados. */
export const PRODUTO = { nome: "Copo Térmico 1,15L", descricao: "Aço inox de parede dupla, mantém a bebida gelada por horas. Tampa com vedação.", preco: 197 } as const;
export const FRETES = [
  { id: "pac", nome: "PAC", prazo: "7 a 12 dias úteis", valor: 19.9 },
  { id: "sedex", nome: "SEDEX", prazo: "2 a 5 dias úteis", valor: 34.9 },
] as const;
export const ADICIONAL = { nome: "canudo inox + escova", preco: 29.9 } as const;
export type FreteId = (typeof FRETES)[number]["id"];

/** Total = produto + frete escolhido + adicional (se marcado). */
export function calcularTotal(frete: string, adicional: boolean): number {
  const f = FRETES.find((x) => x.id === frete);
  if (!f) throw new Error(`Frete inválido: ${frete}`);
  return Math.round((PRODUTO.preco + f.valor + (adicional ? ADICIONAL.preco : 0)) * 100) / 100;
}
export const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
