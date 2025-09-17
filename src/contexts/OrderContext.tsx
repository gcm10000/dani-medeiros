"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { orderService } from "@/services/orderService";
import { PAYMENT_STATUS } from "@/config/api";

interface OrderContextType {
  currentOrderId: string | null;
  currentOrderStatus: string | null;
  paymentStatus: number | null;
  isSSEConnected: boolean;
  setOrderId: (orderId: string) => void;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [isSSEConnected, setIsSSEConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  function navigateWithoutHook(path: string) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Apenas define o ID do pedido
  const setOrderId = (orderId: string) => {
    setCurrentOrderId(orderId);
  };

  // Observa mudanças em currentOrderId e abre a SSE
  useEffect(() => {
    if (!currentOrderId) return;

    // Fecha conexão anterior
    if (eventSource) {
      eventSource.close();
    }

    const newEventSource = orderService.createSSEConnection(currentOrderId);

    newEventSource.onopen = () => {
      setIsSSEConnected(true);
      console.log("SSE conectado para pedido:", currentOrderId);
    };

    newEventSource.addEventListener("orderStatusChanged", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.OrderStatus === "number") {
          setCurrentOrderStatus(data.OrderStatus);
        }
        if (typeof data.PaymentStatus === "number") {
          setPaymentStatus(data.PaymentStatus);
        }

        if (data.PaymentStatus === PAYMENT_STATUS.declined) {
          navigateWithoutHook("/pagamento-recusado");
        }

        if (data.PaymentStatus === PAYMENT_STATUS.refunded) {
          navigateWithoutHook("/pagamento-estornado");
        }
      } catch (error) {
        console.error("Erro ao processar evento orderStatusChanged:", error);
      }
    });

    newEventSource.onerror = (event) => {
      setIsSSEConnected(false);
      console.error("Erro na conexão SSE:", event);
    };

    setEventSource(newEventSource);

    return () => {
      newEventSource.close();
    };
  }, [currentOrderId]);

  // Limpa dados do pedido
  const clearOrder = () => {
    if (eventSource) {
      eventSource.close();
    }
    setCurrentOrderId(null);
    setCurrentOrderStatus(null);
    setPaymentStatus(null);
    setIsSSEConnected(false);
    setEventSource(null);
  };

  // Fecha SSE ao desmontar provider
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const value: OrderContextType = {
    currentOrderId,
    currentOrderStatus,
    paymentStatus,
    isSSEConnected,
    setOrderId,
    clearOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
