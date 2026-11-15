import { z } from "zod";
import { FRETES, calcularTotal } from "./pedido";

export const pixInputSchema = z.object({
  nome: z.string().trim().min(3).max(150),
  email: z.string().email().max(254),
  cpf: z.string().transform((v) => v.replace(/\D/g, "")).pipe(z.string().regex(/^\d{11}$/, "Informe um CPF com 11 dígitos.")),
  telefone: z.string().transform((v) => v.replace(/\D/g, "")).pipe(z.string().min(10).max(13)),
  frete: z.enum(["pac", "sedex"]),
  adicional: z.boolean(),
});
export type PixInput = z.infer<typeof pixInputSchema>;
export interface PixCharge { codigo: string; total: number }

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