import { BASE_URL } from '@/config/api';
import { PagedResult } from '@/utils/pagedResult';

export interface AdminOrder {
  id: number;
  orderStatusId: OrderStatus;
  paymentStatusId: PaymentStatus;

  // Customer data
  customerName: string;
  phoneNumber: string;

  // Shipping address
  address: string;
  number: string;
  complement?: string;
  city: string;
  neighborhood: string;
  zipCode: string;

  // Order info
  notes?: string;
  paymentMethod: string;
  saleType: SaleType;

  // PIX
  pixCode?: string;
  pixQrCodeBase64?: string;
  pixPaidAt?: string; // DateTime em C# vira string ISO

  // Card
  cardBrand?: string;
  cardLast4?: string;
  cardPaidAmount?: number;
  cardPaidAt?: string; // DateTime em C# vira string ISO

  // Valores
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  createdAt: string; // DateTime em C# vira string ISO

  // Items
  items: OrderItemResponse[];
}

export enum PaymentStatus {
  Pending = 0,
  Approved = 1,
  Declined = 2,
  Refunded = 3,
}

export interface OrderItemResponse {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum SaleType {
  Delivery = 0,
  Pickup = 1,
}

export interface OrderSummary {
  id: number;
  status: string;
  customerName: string;
  totalAmount: number;
  createdAt: string; // DateTime em C# vira string ISO no TS
}

// Opcional: enum para status, se você tiver algo similar ao OrderStatus em C#
export enum OrderStatus {
  Pending = 0,
  Preparing = 1,
  Ready = 2,
  OnTheWay = 3,
  Delivered = 4,
  CanceledByClient = 5,
  CanceledByVendor = 6,
  CanceledBySystem = 7,
}


export const orderService = {
  // Buscar pedido por ID
  async getOrderById(orderId: number): Promise<AdminOrder | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Orders/${orderId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return null;
    }
  },

  // Criar novo pedido
  async createOrder(orderData: any): Promise<string | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Erro ao criar pedido');
      
      const result = await response.json();
      return result.orderId || result.id;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return null;
    }
  },

  // Cancelar pedido
  async cancelOrder(orderId: string | number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/Orders/cancel_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      return false;
    }
  },

  // Conectar ao SSE para updates em tempo real
  createSSEConnection(orderId: string): EventSource {
    return new EventSource(`${BASE_URL}/api/Orders/stream/${orderId}`);
  },

  createNewOrdersSSEConnection(): EventSource {
    return new EventSource(`${BASE_URL}/api/Orders/stream/new-orders`);
  },

  // Admin: Buscar todos os pedidos
  async getAllAdmin(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    paymentStatus?: PaymentStatus,
    orderStatus?: OrderStatus
  ): Promise<PagedResult<OrderSummary>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    
    if (search) params.append('search', search);
    if (paymentStatus !== undefined) params.append('paymentStatus', paymentStatus.toString());
    if (orderStatus !== undefined) params.append('orderStatus', orderStatus.toString());
    
    const response = await fetch(`${BASE_URL}/api/Orders?${params.toString()}`);
    if (!response.ok) throw new Error('Erro ao buscar pedidos');
    return await response.json();
  },

  // Admin: Criar pedido manual
  async createManual(orderData: any): Promise<string | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Orders/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Erro ao criar pedido manual');
      const result = await response.json();
      return result.orderId || result.id;
    } catch (error) {
      console.error('Erro ao criar pedido manual:', error);
      return null;
    }
  },

  // Admin: Aprovar pagamento
  async approvePayment(orderId: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/Orders/${orderId}/approve-payment`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao aprovar pagamento:', error);
      return false;
    }
  },

  // Admin: Recusar pagamento
  async declinePayment(orderId: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/Orders/${orderId}/decline-payment`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao recusar pagamento:', error);
      return false;
    }
  },

  // Admin: Marcar pedido como pronto
  async markReady(orderId: number): Promise<void> {
    try {
      await fetch(`${BASE_URL}/api/Orders/${orderId}/ready`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erro ao marcar pedido como pronto:', error);
      throw error;
    }
  },

  // Admin: Marcar pedido como pronto
  async markAsConfirmed(orderId: number): Promise<void> {
    try {
      await fetch(`${BASE_URL}/api/Orders/${orderId}/confirmed`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erro ao marcar pedido como confirmado:', error);
      throw error;
    }
  },

  // Admin: Marcar pedido a caminho
  async markOnTheWay(orderId: number): Promise<void> {
    try {
      await fetch(`${BASE_URL}/api/Orders/${orderId}/on-the-way`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erro ao marcar pedido a caminho:', error);
      throw error;
    }
  },

  // Admin: Marcar pedido como entregue
  async markDelivered(orderId: number): Promise<void> {
    try {
      await fetch(`${BASE_URL}/api/Orders/${orderId}/delivered`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erro ao marcar pedido como entregue:', error);
      throw error;
    }
  }
};