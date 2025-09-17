// app/pix-payment/[orderId]/PixPaymentClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getPixDataResponse } from "@/utils/pixDataStorage";
import { useOrder } from "@/contexts/OrderContext";
import { paymentStatusMap } from "@/config/paymentStatusMap";
import { paymentService } from "@/services/paymentService";
import { generateIdempotencyKey } from "@/utils/idempotencyKey";
import { AdminOrder } from "@/services/orderService";

type PixPaymentClientProps = {
  orderId: number;
  orderData: AdminOrder | null;
};

const PixPaymentClient: React.FC<PixPaymentClientProps> = ({ orderId, orderData }) => {
  const { paymentStatus, setOrderId } = useOrder();
  const [copiedCode, setCopiedCode] = useState(false);

  // useEffect(() => {
  //   setOrderId(orderId.toString());
  // }, [orderId, setOrderId]);

  // useEffect(() => {
  //   const data = getPixDataResponse(orderId.toString());
  //   setPixData(data);
  // }, [orderId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  const copyPixCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast({
        title: "Código copiado!",
        description: "Código PIX copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // redirecionamento depende só de `paymentStatus`
  if (paymentStatus === paymentStatusMap.Approved) {
    toast({
      title: "Pagamento aprovado!",
      description: "Redirecionando para acompanhamento do pedido...",
    });
    window.location.href = `/acompanhar-pedido/${orderId}`;
  } else if (paymentStatus === paymentStatusMap.Declined) {
    window.location.href = "/pagamento-recusado";
  } else if (paymentStatus === paymentStatusMap.Refunded) {
    window.location.href = "/pagamento-estornado";
  }

  const handleRetryPixPayment = async () => {
    const idempotencyKey = generateIdempotencyKey();
    paymentService.generatePixPayment(orderData, idempotencyKey);
  };

  if (!orderData) {
    return (
      <div className="min-h-screen py-8">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Dados do pedido não encontrados
            </h1>
            <a href="/checkout">
              <Button variant="hero">Voltar ao Checkout</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <a href="/checkout">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </a>
          <div>
            <h1 className="text-4xl font-bold text-foreground font-dancing">
              {`Pedido #${orderId}` || "Processando pedido..."}
            </h1>
            <p className="text-muted-foreground">Pagamento via PIX</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Pedido */}
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {orderData.items.map((item: any) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-medium">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span>{formatPrice(orderData.shippingCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(orderData.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PIX Payment */}
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle>Pagamento PIX</CardTitle>
            </CardHeader>
            <CardContent>
              {orderData ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Escaneie o QR Code abaixo ou copie o código PIX para realizar o pagamento.
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <img
                        src={`data:image/png;base64,${orderData.pixQrCodeBase64}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="text-sm font-medium">Código PIX</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={orderData.pixCode}
                          readOnly
                          className="font-mono text-xs bg-muted"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyPixCode(orderData.pixCode || "")}
                          className="shrink-0"
                        >
                          {copiedCode ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Após confirmar o pagamento, seu pedido será processado automaticamente.
                  </div>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Pagamento confirmado!",
                        description: "Redirecionando para acompanhamento do pedido...",
                      });
                      window.location.href = `/acompanhar-pedido/${orderId}`;
                    }}
                    variant="hero"
                    className="w-full"
                  >
                    Simular Pagamento Confirmado
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Erro ao gerar código PIX</p>
                  <Button onClick={handleRetryPixPayment} variant="outline" className="mt-4">
                    Tentar novamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PixPaymentClient;
