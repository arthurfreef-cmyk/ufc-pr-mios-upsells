import { describe, expect, it } from "vitest";
import { montarCobranca, pixInputSchema, extrairCodigoPix, extrairOrderUuid, validarPedidoProvider, FRUITFY_CHARGE_URL, cpfValido } from "@/lib/fruitfy";
const cliente = { nome: "João Silva", email: "joao@example.com", cpf: "12345678900", telefone: "11999999999", frete: "pac" as const, adicional: false,
  endereco: { cep: "01001-000", estado: "SP", endereco: "Praça da Sé", numero: "1", complemento: "", bairro: "Sé", cidade: "São Paulo" } };
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
  it("usa /api uma única vez no endereço documentado", () => {
    expect(FRUITFY_CHARGE_URL).toBe("https://api.fruitfy.io/api/pix/charge");
  });
  it("exige endereço de entrega completo", () => {
    expect(pixInputSchema.safeParse({ ...cliente, endereco: { ...cliente.endereco, cidade: "" } }).success).toBe(false);
  });
  it("extrai o order_uuid fornecido pela criação da cobrança", () => {
    expect(extrairOrderUuid({ data: { order_uuid: "a335fce2-9eb3-48c4-9743-9a4220296ce6" } })).toBe("a335fce2-9eb3-48c4-9743-9a4220296ce6");
    expect(extrairOrderUuid({ order_uuid: "not-an-id" })).toBeNull();
    expect(extrairOrderUuid({ data: { order_id: "a335fce2-9eb3-48c4-9743-9a4220296ce6" } })).toBe("a335fce2-9eb3-48c4-9743-9a4220296ce6");
  });
  it("valida os dígitos verificadores do CPF antes de cobrar", () => {
    expect(cpfValido("52998224725")).toBe(true);
    expect(cpfValido("12345678900")).toBe(false);
  });
  const uuid = "a335fce2-9eb3-48c4-9743-9a4220296ce6";
  const paid = { success: true, data: { uuid, status: "paid", total_gross_amount: 990, total_paid_amount: 990, payment_method: "pix", paid_at: "2026-11-15T04:00:00Z" } };
  it("confirma somente pedido pago com identidade e valor esperados", () => {
    expect(validarPedidoProvider(paid, uuid, 990).status).toBe("paid");
    expect(() => validarPedidoProvider(paid, "a2ed909a-75ca-40d5-a7a4-b6eb7559d796", 990)).toThrow();
  });
  it("não aceita confirmação com valor pago divergente", () => {
    expect(() => validarPedidoProvider({ ...paid, data: { ...paid.data, total_paid_amount: 100 } }, uuid, 990)).toThrow();
  });
  it("não aceita webhook como prova de pagamento", () => {
    expect(() => validarPedidoProvider({ event: "order_paid", order: paid.data }, uuid, 990)).toThrow();
  });
});