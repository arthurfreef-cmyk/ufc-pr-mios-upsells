import { createServerFn } from "@tanstack/react-start";
import { pixInputSchema, montarCobranca, extrairCodigoPix, type PixCharge } from "./fruitfy";

export const gerarPix = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pixInputSchema.parse(input))
  .handler(async ({ data }): Promise<PixCharge> => {
    const token = process.env["FRUITFY_API_TOKEN"];
    if (!token) throw new Error("O token da Fruitfy não está configurado.");
    const body = montarCobranca(data);
    const response = await fetch("https://api.fruitfy.io/pix/charge", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Store-Id": "a2ed909a-75ca-40d5-a7a4-b6eb7559d796", "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    // Do not log response bodies: payment providers can echo customer information or credentials.
    if (!response.ok) {
      console.error("Fruitfy charge failed", response.status);
      throw new Error(`A Fruitfy recusou a cobrança (HTTP ${response.status}). Confira os dados e a configuração da conta.`);
    }
    const result: unknown = await response.json();
    const codigo = extrairCodigoPix(result);
    if (!codigo) throw new Error("A Fruitfy não retornou um código Pix válido. Não gere outra cobrança antes de conferir a anterior no painel Fruitfy.");
    return { codigo, total: body.amount / 100 };
  });