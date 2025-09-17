"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Phone, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_URL } from "@/config/api";
import { orderService } from "@/services/orderService";
import { usePathname, useRouter } from "next/navigation";

const statusMap = {
  pending: "🕐 Aguardando a confirmação da loja",
  preparing: "👩 Preparando seu pedido",
  ready: "📦 Pedido pronto para entrega",
  on_the_way: "🚚 Saiu para entrega",
  delivered: "🍽️ Pedido entregue",
  canceled_by_client: "❌ Pedido cancelado pelo cliente",
  canceled_by_vendor: "⚠️ Pedido cancelado pelo estabelecimento"
};

const statusOrder = ["pending", "preparing", "ready", "on_the_way", "delivered"];

type OrderStatus = keyof typeof statusMap;

interface LocalOrderData {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  estimatedTime?: string;
  items: Array<{
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
}

interface OrderTrackingProps {
  params: {
    orderId: string;
  } | Promise<{ orderId: string }>; // pode ser promise ou objeto direto
}

const OrderTracking = ({ params }: OrderTrackingProps) => {
  const { orderId } = React.use(params as unknown as React.Usable<{ orderId: string }>);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [orderData, setOrderData] = useState<LocalOrderData | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("pending");
  const [isConnected, setIsConnected] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const getProgress = (status: OrderStatus) => {
    if (status.includes("canceled")) return 0;
    const index = statusOrder.indexOf(status);
    return index >= 0 ? ((index + 1) / statusOrder.length) * 100 : 0;
  };

  const canCancel = (status: OrderStatus) =>
    !["on_the_way", "delivered", "canceled_by_client", "canceled_by_vendor"].includes(status);

  const handleCancelOrder = async () => {
    if (!orderData || !canCancel(currentStatus)) return;
    setIsCanceling(true);
    try {
      const success = await orderService.cancelOrder(orderData.id);
      if (success) {
        setCurrentStatus("canceled_by_client");
        toast({
          title: "Pedido cancelado",
          description: "Seu pedido foi cancelado com sucesso."
        });
      } else throw new Error("Erro ao cancelar pedido");
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCanceling(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    if (["delivered", "canceled_by_client", "canceled_by_vendor"].includes(currentStatus)) {
      setIsConnected(false);
      return;
    }

    const eventSource = orderService.createSSEConnection(orderId);

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("SSE conectado para pedido:", orderId);
    };

    eventSource.addEventListener("orderStatusChanged", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.OrderStatus === "number") {
          const statusKey = statusOrder[data.OrderStatus] as OrderStatus;
          setCurrentStatus(statusKey);

          toast({
            title: "Status atualizado",
            description: statusMap[statusKey]
          });

          if (["delivered", "canceled_by_client", "canceled_by_vendor"].includes(statusKey)) {
            eventSource.close();
            setIsConnected(false);
          }
        }
      } catch (error) {
        console.error("Erro ao processar evento orderStatusChanged:", error);
      }
    });

    eventSource.onerror = (event) => {
      setIsConnected(false);
      console.error("Erro na conexão SSE", event);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [orderId, toast]);

  useEffect(() => {
    setIsLoadingOrder(true);
    fetch(`${BASE_URL}/api/Orders/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const statusMapArr: OrderStatus[] = [
            "pending",
            "preparing",
            "ready",
            "on_the_way",
            "delivered",
            "canceled_by_client",
            "canceled_by_vendor"
          ];
          const status =
            typeof data.orderStatusId === "number" && statusMapArr[data.orderStatusId]
              ? statusMapArr[data.orderStatusId]
              : "pending";
          const localData: LocalOrderData = {
            id: String(data.id),
            totalAmount: data.totalAmount,
            paymentMethod: data.paymentMethod,
            status,
            estimatedTime: undefined,
            items: (data.items || []).map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              total: item.lineTotal
            }))
          };
          setOrderData(localData);
          setCurrentStatus(localData.status);
        }
      })
      .finally(() => setIsLoadingOrder(false));
  }, [orderId, pathname]);

  if (isLoadingOrder) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-40 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Pedido não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os dados do seu pedido.
            </p>
            <Button onClick={() => router.push("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCanceled = currentStatus.includes("canceled");
  const progress = getProgress(currentStatus);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Acompanhar Pedido</h1>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
          </Badge>
        </div>
      </div>

      {/* Status e Progresso */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pedido #{orderData.id}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {formatPrice(orderData.totalAmount)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barra de progresso */}
          {!isCanceled && (
            <div className="mb-6">
              <Progress value={progress} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% concluído
              </p>
            </div>
          )}

          {/* Status atual */}
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">
              {statusMap[currentStatus].split(" ")[0]}
            </div>
            <h3 className="text-lg font-semibold">
              {statusMap[currentStatus].substring(2)}
            </h3>
            {orderData.estimatedTime && !isCanceled && (
              <p className="text-muted-foreground mt-2">
                Tempo estimado: {orderData.estimatedTime}
              </p>
            )}
          </div>

          {/* Timeline de status */}
          <div className="space-y-4">
            {statusOrder.map((status, index) => {
              const isActive = status === currentStatus;
              const isCompleted = statusOrder.indexOf(currentStatus) > index;
              const isPending = statusOrder.indexOf(currentStatus) < index;
              
              return (
                <div key={status} className="flex items-center space-x-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm
                    ${isActive ? "bg-primary text-primary-foreground" : ""}
                    ${isCompleted ? "bg-green-500 text-white" : ""}
                    ${isPending ? "bg-muted text-muted-foreground" : ""}
                  `}>
                    {isCompleted ? "✓" : statusMap[status as OrderStatus].split(" ")[0]}
                  </div>
                  <div className={`flex-1 ${isPending ? "text-muted-foreground" : ""}`}>
                    <p className={`${isActive ? "font-semibold" : ""}`}>
                      {statusMap[status as OrderStatus].substring(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informações do pedido */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detalhes do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.quantity}x {item.productName}</span>
                <span>{formatPrice(item.total)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(orderData.totalAmount)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Pagamento: {orderData.paymentMethod}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="space-y-4">
        {/* Botão de cancelamento */}
        {canCancel(currentStatus) && (
          <Button 
            variant="destructive" 
            onClick={handleCancelOrder}
            disabled={isCanceling}
            className="w-full"
          >
            {isCanceling ? "Cancelando..." : "Cancelar Pedido"}
          </Button>
        )}

        {/* Contato */}
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            <Phone className="mr-2 h-4 w-4" />
            Ligar para a loja
          </Button>
          {/* <Button variant="outline" className="flex-1">
            <MapPin className="mr-2 h-4 w-4" />
            Ver no mapa
          </Button> */}
        </div>
      </div>

      {/* Mensagem de cancelamento */}
      {isCanceled && (
        <Card className="mt-6 border-destructive">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-4">😔</div>
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Pedido Cancelado
            </h3>
            <p className="text-muted-foreground">
              {currentStatus === "canceled_by_client" 
                ? "Você cancelou este pedido." 
                : "O estabelecimento cancelou este pedido. Entre em contato para mais informações."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderTracking;