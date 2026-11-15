import { z } from "zod";
import { FRETES, calcularTotal } from "./pedido";

export function cpfValido(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const size of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < size; i++) sum += Number(cpf[i]) * (size + 1 - i);
    const digit = (sum * 10 % 11) % 10;
    if (digit !== Number(cpf[size])) return false;
  }
  return true;
}

export const pixInputSchema = z.object({
  nome: z.string().trim().min(3).max(150),
  email: z.string().email().max(254),
  cpf: z.string().transform((v) => v.replace(/\D/g, "")).pipe(z.string().refine(cpfValido, "Informe um CPF válido.")),
  telefone: z.string().transform((v) => v.replace(/\D/g, "")).pipe(z.string().min(10).max(13)),
  frete: z.enum(["pac", "sedex"]),
  adicional: z.boolean(),
  endereco: z.object({
    cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido."),
    estado: z.string().trim().regex(/^[A-Za-z]{2}$/),
    endereco: z.string().trim().min(3).max(200),
    numero: z.string().trim().min(1).max(20),
    complemento: z.string().trim().max(100),
    bairro: z.string().trim().min(2).max(100),
    cidade: z.string().trim().min(2).max(100),
  }),
});
export type PixInput = z.infer<typeof pixInputSchema>;
export interface PixCharge { codigo: string; total: number; pedidoId: string }
export const FRUITFY_STORE_ID = "a2ed909a-75ca-40d5-a7a4-b6eb7559d796";
export const FRUITFY_CHARGE_URL = "https://api.fruitfy.io/api/pix/charge";
export const statusSchema = z.enum(["waiting_payment", "pending", "paid", "refused", "partial_refunded", "canceled", "refunded", "chargeback", "failed"]);
export type PaymentStatus = z.infer<typeof statusSchema>;
export const providerOrderSchema = z.object({
  success: z.literal(true),
  data: z.object({ uuid: z.string().uuid(), status: statusSchema,
    total_gross_amount: z.number().int(), total_paid_amount: z.number().int(),
    payment_method: z.literal("pix"), paid_at: z.string().nullable(),
  }),
});
export function validarPedidoProvider(value: unknown, uuid: string, amount: number) {
  const result = providerOrderSchema.parse(value).data;
  if (result.uuid !== uuid || result.total_gross_amount !== amount ||
    (result.status === "paid" && (result.total_paid_amount !== amount || !result.paid_at))) {
    throw new Error("A confirmação da Fruitfy não corresponde ao pedido.");
  }
  return result;
}

export function extrairOrderUuid(value: unknown, depth = 0): string | null {
  if (!value || typeof value !== "object" || depth > 6) return null;
  const record = value as Record<string, unknown>;
  for (const key of ["order_uuid", "order_id", "uuid"]) {
    const result = z.string().uuid().safeParse(record[key]);
    if (result.success) return result.data;
  }
  for (const key of ["data", "order"]) {
    const result = extrairOrderUuid(record[key], depth + 1);
    if (result) return result;
  }
  return null;
}

export function montarCobranca(input: PixInput) {
  const frete = FRETES.find((f) => f.id === input.frete);
  if (!frete) throw new Error("Frete inválido");
  const amount = Math.round(calcularTotal(input.frete, input.adicional) * 100);
  return {
    name: input.nome, email: input.email, cpf: input.cpf,
    phone: input.telefone.length <= 11 ? `55${input.telefone}` : input.telefone,
    amount,
    items: [{ id: "a335fce2-9eb3-48c4-9743-9a4220296ce6", value: amount, quantity: 1 }],
  };
}

/** Only a returned EMV Pix payload is accepted; never manufacture a payment code. */
export function extrairCodigoPix(value: unknown, depth = 0): string | null {
  if (depth > 8) return null;
  if (typeof value === "string") {
    const code = value.trim();
    return code.startsWith("000201") && code.toLowerCase().includes("br.gov.bcb.pix") && code.length <= 4096 ? code : null;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) {
      const code = extrairCodigoPix(child, depth + 1);
      if (code) return code;
    }
  }
  return null;
}