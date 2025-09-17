import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { orderService } from '@/services/orderService';
import { PAYMENT_STATUS, PaymentStatusType, ORDER_STATUS } from '@/config/api';
import { toast } from '@/hooks/use-toast';

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
    throw new Error('useOrder must be used within an OrderProvider');
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
  
  // Função para iniciar conexão SSE
  const startSSEConnection = (orderId: string) => {
    // Fechar conexão anterior se existir
    if (eventSource) {
      eventSource.close();
    }

    const newEventSource = orderService.createSSEConnection(orderId);

    newEventSource.onopen = () => {
      setIsSSEConnected(true);
      console.log('SSE conectado para pedido:', orderId);
    };

    // Listener para mudanças de status do pedido
    newEventSource.addEventListener('orderStatusChanged', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.OrderStatus === 'number') {
            setCurrentOrderStatus(data.OrderStatus);
        }
        if (typeof data.PaymentStatus === 'number') {
            setPaymentStatus(data.PaymentStatus);
        }

        if (data.PaymentStatus === PAYMENT_STATUS.declined) {
          navigateWithoutHook("/pagamento-recusado");
        }

        if (data.PaymentStatus === PAYMENT_STATUS.refunded) {
          navigateWithoutHook("/pagamento-estornado");
        }

      } catch (error) {
        console.error('Erro ao processar evento orderStatusChanged:', error);
      }
    });

    newEventSource.onerror = (event) => {
      setIsSSEConnected(false);
      console.error('Erro na conexão SSE:', event);
    };

    setEventSource(newEventSource);
  };

  // Função para definir o ID do pedido e iniciar SSE
  const setOrderId = (orderId: string) => {
    setCurrentOrderId(orderId);
    startSSEConnection(orderId);
  };

  // Função para limpar dados do pedido
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

  // Cleanup quando o componente for desmontado
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

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};