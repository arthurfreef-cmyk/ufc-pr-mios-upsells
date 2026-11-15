/** Valores da oferta de resgate e opções adicionais. */
export const PRODUTO = { nome: "Copo Térmico UFC 1,15L", descricao: "Aço inox de parede dupla, mantém a bebida gelada por horas. Tampa com vedação.", preco: 0, valorOriginal: 197 } as const;
export const FRETES = [
  { id: "pac", nome: "PAC", prazo: "7 a 12 dias úteis", valor: 9.9 },
  { id: "sedex", nome: "SEDEX", prazo: "2 a 5 dias úteis", valor: 19.9 },
] as const;
export const ADICIONAL = { nome: "Copo Térmico UFC 1,15L adicional", preco: 19.9 } as const;
export type FreteId = (typeof FRETES)[number]["id"];
/** O copo do desafio custa R$ 0; total considera frete e adicional opcional. */
export function calcularTotal(frete: string, adicional: boolean): number {
  const f = FRETES.find((x) => x.id === frete);
  if (!f) throw new Error(`Frete inválido: ${frete}`);
  return Math.round((f.valor + (adicional ? ADICIONAL.preco : 0)) * 100) / 100;
}
export const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
