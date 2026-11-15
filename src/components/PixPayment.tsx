import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reais } from "@/lib/pedido";
import type { PixCharge } from "@/lib/fruitfy";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { consultarPagamento } from "@/lib/fruitfy.functions";

export interface PixPaymentProps { pagamento: PixCharge; successUrl?: string }
export function PixPayment({ pagamento, successUrl = "/upsell" }: PixPaymentProps) {
  const consultar = useServerFn(consultarPagamento);
  const confirmacao = useQuery({
    queryKey: ["pagamento", pagamento.pedidoId],
    queryFn: () => consultar({ data: { pedidoId: pagamento.pedidoId } }),
    refetchInterval: (query) => ["paid", "canceled", "refunded", "failed", "refused", "chargeback"].includes(query.state.data?.status ?? "") ? false : 20000,
    retry: false,
  });
  const [imagem, setImagem] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");
  useEffect(() => {
    const storageKey = `meta_add_payment_info_${pagamento.pedidoId}`;
    try {
      if (window.localStorage.getItem(storageKey) !== "1") {
        const pixel = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
        if (typeof pixel === "function") {
          pixel("track", "AddPaymentInfo", {
            value: pagamento.total,
            currency: "BRL",
            payment_method: "pix",
          });
          window.localStorage.setItem(storageKey, "1");
        }
      }
    } catch {
      // Tracking storage is optional and must never interrupt Pix display.
    }
  }, [pagamento.pedidoId, pagamento.total]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(pagamento.codigo, { width: 280, margin: 4, errorCorrectionLevel: "M" })
      .then((url) => { if (active) setImagem(url); })
      .catch(() => { if (active) setErro("Não foi possível exibir o QR Code. Use o código Pix abaixo."); });
    return () => { active = false; };
  }, [pagamento.codigo]);
  useEffect(() => {
    if (confirmacao.data?.status !== "paid") return;

    // Purchase is emitted only after the provider API confirms the paid status.
    const storageKey = `meta_purchase_${pagamento.pedidoId}`;
    try {
      if (window.localStorage.getItem(storageKey) !== "1") {
        const pixel = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
        if (typeof pixel === "function") {
          pixel("track", "Purchase", {
            value: pagamento.total,
            currency: "BRL",
            content_name: "Copo Térmico UFC 1,15L",
            content_type: "product",
          });
          window.localStorage.setItem(storageKey, "1");
        }
      }
    } catch {
      // Storage can be unavailable; the verified payment flow must still continue.
    }

    if (successUrl) {
      const redirectTimer = window.setTimeout(() => window.location.replace(successUrl), 800);
      return () => window.clearTimeout(redirectTimer);
    }
  }, [confirmacao.data?.status, pagamento.pedidoId, pagamento.total, successUrl]);
  async function copiar() {
    try { await navigator.clipboard.writeText(pagamento.codigo); setCopiado(true); }
    catch { setErro("Selecione e copie o código no campo abaixo."); }
  }
  if (confirmacao.data?.status === "paid") return <section className="space-y-4 border border-border bg-card p-7 text-center">
    <Check className="mx-auto h-12 w-12 text-primary" />
    <h2 className="font-display text-3xl font-black uppercase">Pagamento confirmado</h2>
    <p>Seu pedido de {reais(pagamento.total)} foi pago. Redirecionando…</p>
  </section>;
  const encerrado = ["canceled", "refunded", "failed", "refused", "chargeback", "partial_refunded"].includes(confirmacao.data?.status ?? "");
  if (encerrado) return <section className="space-y-4 border border-border bg-card p-7 text-center">
    <h2 className="font-display text-3xl font-black uppercase">Pagamento encerrado</h2>
    <p>Esta cobrança não está disponível para pagamento. Confira o pedido com a loja.</p>
  </section>;
  return <section className="space-y-5 border border-border bg-card p-5 text-center sm:p-7">
    <h2 className="font-display text-3xl font-black uppercase">Pagamento via Pix</h2>
    <p className="text-xl font-bold text-primary">{reais(pagamento.total)}</p>
    <div className="mx-auto flex h-[280px] w-[280px] max-w-full items-center justify-center">
      {imagem ? <img src={imagem} alt="QR Code do pagamento Pix" width={280} height={280} className="max-w-full" /> : <span role="status" className="text-muted-foreground">Gerando QR Code…</span>}
    </div>
    <Input aria-label="Código Pix copia e cola" value={pagamento.codigo} readOnly onFocus={(e) => e.target.select()} />
    <Button type="button" onClick={copiar} className="w-full"><span>{copiado ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}</span>{copiado ? "Código copiado" : "Copiar código Pix"}</Button>
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    {confirmacao.error && <p role="alert" className="text-sm text-destructive">Não foi possível consultar a confirmação agora.</p>}
    <Button type="button" variant="outline" disabled={confirmacao.isFetching} onClick={() => void confirmacao.refetch()}>Verificar pagamento</Button>
    <p className="text-sm text-muted-foreground">Aguardando pagamento. A geração do Pix não confirma o pagamento nem a entrega.</p>
  </section>;
}