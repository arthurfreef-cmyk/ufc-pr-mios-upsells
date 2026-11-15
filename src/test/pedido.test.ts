import { describe, it, expect } from "vitest";
import { calcularTotal } from "@/lib/pedido";

describe("total do pedido com resgate do desafio", () => {
  it("cobra somente o PAC quando o copo é resgatado grátis", () =>
    expect(calcularTotal("pac", false)).toBe(9.9));
  it("cobra somente o SEDEX quando o copo é resgatado grátis", () =>
    expect(calcularTotal("sedex", false)).toBe(19.9));
  it("inclui o copo adicional de R$ 47,90 quando selecionado", () =>
    expect(calcularTotal("pac", true)).toBe(57.8));
  it("soma SEDEX e copo adicional", () =>
    expect(calcularTotal("sedex", true)).toBe(67.8));
});
