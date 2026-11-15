import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reais } from "@/lib/pedido";
import type { PixCharge } from "@/lib/fruitfy";

export interface PixPaymentProps { pagamento: PixCharge }
export function PixPayment({ pagamento }: PixPaymentProps) {
  const [imagem, setImagem] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(pagamento.codigo, { width: 280, margin: 4, errorCorrectionLevel: "M" })
      .then((url) => { if (active) setImagem(url); })
      .catch(() => { if (active) setErro("Não foi possível exibir o QR Code. Use o código Pix abaixo."); });
    return () => { active = false; };
  }, [pagamento.codigo]);
  async function copiar() {
    try { await navigator.clipboard.writeText(pagamento.codigo); setCopiado(true); }
    catch { setErro("Selecione e copie o código no campo abaixo."); }
  }
  return <section className="space-y-5 border border-border bg-card p-5 text-center sm:p-7">
    <h2 className="font-display text-3xl font-black uppercase">Pagamento via Pix</h2>
    <p className="text-xl font-bold text-primary">{reais(pagamento.total)}</p>
    <div className="mx-auto flex h-[280px] w-[280px] max-w-full items-center justify-center">
      {imagem ? <img src={imagem} alt="QR Code do pagamento Pix" width={280} height={280} className="max-w-full" /> : <span role="status" className="text-muted-foreground">Gerando QR Code…</span>}
    </div>
    <Input aria-label="Código Pix copia e cola" value={pagamento.codigo} readOnly onFocus={(e) => e.target.select()} />
    <Button type="button" onClick={copiar} className="w-full"><span>{copiado ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}</span>{copiado ? "Código copiado" : "Copiar código Pix"}</Button>
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    <p className="text-sm text-muted-foreground">Aguardando pagamento. A geração do Pix não confirma o pagamento nem a entrega.</p>
  </section>;
}