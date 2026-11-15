import { describe, expect, it } from "vitest";
import { montarCobranca, pixInputSchema, extrairCodigoPix } from "@/lib/fruitfy";
const cliente = { nome: "João Silva", email: "joao@example.com", cpf: "12345678900", telefone: "11999999999", frete: "pac" as const, adicional: false };
describe("cobrança Fruitfy", () => {
  it("envia PAC em centavos e quantidade unitária", () => {
    expect(montarCobranca(cliente)).toMatchObject({ amount: 990, items: [{ id: "a335fce2-9eb3-48c4-9743-9a4220296ce6", value: 990, quantity: 1 }] });
  });
  it("envia SEDEX e adicional sem aceitar valores do navegador", () => {
    const body = montarCobranca({ ...cliente, frete: "sedex", adicional: true });
    expect(body.amount).toBe(6780);
    expect(body.items.reduce((sum, item) => sum + item.value * item.quantity, 0)).toBe(6780);
  });
  it("rejeita CPF incompleto", () => expect(pixInputSchema.safeParse({ ...cliente, cpf: "123" }).success).toBe(false));
  it("não trata evento pago ou URL como código Pix", () => expect(extrairCodigoPix({ event: "order_paid", qr: "https://example.com" })).toBeNull());
  it("extrai somente o payload Pix retornado", () => {
    const codigo = "000201010212br.gov.bcb.pix6304ABCD";
    expect(extrairCodigoPix({ data: { pix: { code: codigo } } })).toBe(codigo);
  });
});