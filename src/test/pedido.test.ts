import { describe, it, expect } from "vitest";
import { calcularTotal } from "@/lib/pedido";
describe("total do pedido", () => {
  it("soma produto e frete", () => expect(calcularTotal("pac", false)).toBe(216.9));
  it("inclui adicional só quando marcado", () => expect(calcularTotal("sedex", true)).toBe(261.8));
});
