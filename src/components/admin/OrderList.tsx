"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Clock, Package, Search, Truck, XCircle } from 'lucide-react';
import { OrderSummary, PaymentStatus, OrderStatus } from '@/services/orderService';
import { paymentStatusMap } from '@/config/paymentStatusMap';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Label } from '@radix-ui/react-label';

interface OrderListProps {
  orders: OrderSummary[];
  loading: boolean;
  pagedResult: { totalCount: number } | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedPaymentStatus: PaymentStatus | null;
  setSelectedPaymentStatus: (status: PaymentStatus | null) => void;
  selectedOrderStatus: OrderStatus | null;
  setSelectedOrderStatus: (status: OrderStatus | null) => void;
  onSelectOrder: (order: OrderSummary) => void;
  selectedOrderId: number | null;
  onSearch: () => void;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  loading,
  pagedResult,
  searchTerm,
  setSearchTerm,
  selectedPaymentStatus,
  setSelectedPaymentStatus,
  selectedOrderStatus,
  setSelectedOrderStatus,
  onSelectOrder,
  selectedOrderId,
  onSearch
}) => {
  const getPaymentStatusLabel = (status: PaymentStatus) => {
    const map = {
      [PaymentStatus.Pending]: 'Pendente',
      [PaymentStatus.Approved]: 'Aprovado',
      [PaymentStatus.Declined]: 'Recusado',
      [PaymentStatus.Refunded]: 'Estornado',
    };
    return map[status] || 'Desconhecido';
  };

  const getOrderStatusLabelFromEnum = (status: OrderStatus) => {
    const map = {
      [OrderStatus.Pending]: 'Pendente',
      [OrderStatus.Preparing]: 'Preparando',
      [OrderStatus.Ready]: 'Pronto',
      [OrderStatus.OnTheWay]: 'A Caminho',
      [OrderStatus.Delivered]: 'Entregue',
      [OrderStatus.CanceledByClient]: 'Cancelado pelo Cliente',
      [OrderStatus.CanceledByVendor]: 'Cancelado pela Loja',
      [OrderStatus.CanceledBySystem]: 'Cancelado pelo Sistema',
    };
    return map[status] || 'Desconhecido';
  };

  
  const orderStatusStringMap = {
    pending: 'Pendente',
    preparing: 'Preparando',
    ready: 'Pronto',
    on_the_way: 'A Caminho',
    delivered: 'Entregue',
    canceled_by_client: 'Cancelado pelo Cliente',
    canceled_by_vendor: 'Cancelado pela Loja',
    canceled_by_system: 'Cancelado pelo Sistema',
  } as const;

  type OrderStatusString = keyof typeof orderStatusStringMap;

  const getOrderStatusLabel = (status: string) => {
    if (status in orderStatusStringMap) {
      return orderStatusStringMap[status as OrderStatusString];
    }
    return 'Desconhecido';
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getTimeAgo = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });

  const getOrderStatusColor = (status: string) => {
    if (status === 'delivered') return 'default';
    if (status === 'canceled_by_client') return 'destructive';
    return 'secondary';
  };

  const getOrderStatusIcon = (status: string) => {
    if (status === 'pending') return <Clock className="w-4 h-4" />;
    if (status === 'preparing') return <Package className="w-4 h-4" />;
    if (status === 'ready') return <CheckCircle className="w-4 h-4" />;
    if (status === 'ontheway') return <Truck className="w-4 h-4" />;
    if (status === 'delivered') return <CheckCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Pedidos</h2>
          <Badge variant="destructive" className="rounded-full">{pagedResult?.totalCount || 0}</Badge>
        </div>
        {/* Campo de busca */}
        <div className="mb-4 relative">
          <Input
            placeholder="Buscar por nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="pr-10"
          />
          <Button 
            onClick={onSearch}
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {/* Filtros */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">Status do Pagamento</Label>
            <Select
              value={selectedPaymentStatus !== null ? String(selectedPaymentStatus) : 'all'}
              onValueChange={value => setSelectedPaymentStatus(value === 'all' ? null : Number(value) as PaymentStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(paymentStatusMap).map(([key, value]) => (
                  <SelectItem key={key} value={String(value)}>{getPaymentStatusLabel(value as PaymentStatus)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">Status do Pedido</Label>
            <Select
              value={selectedOrderStatus !== null ? String(selectedOrderStatus) : 'all'}
              onValueChange={value => setSelectedOrderStatus(value === 'all' ? null : Number(value) as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.values(OrderStatus).filter(v => typeof v === 'number').map((status) => (
                  <SelectItem key={status} value={String(status)}>{getOrderStatusLabelFromEnum(status as OrderStatus)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-100">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          : orders.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedOrderId === order.id ? 'bg-pink-50 border-l-4 border-l-pink-500' : ''
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-sm font-medium">#{order.id}</span>
                  <span className="text-xs text-gray-500">{getTimeAgo(order.createdAt)}</span>
                </div>
                <div className="text-sm text-gray-600">{order.customerName}</div>
                <div className="flex items-center justify-between mt-2">
                    <Badge variant={getOrderStatusColor(order.status.toLowerCase())} className="flex items-center space-x-1">
                      {getOrderStatusIcon(order.status.toLowerCase())}
                      <span>{getOrderStatusLabel(order.status.toLowerCase())}</span>
                    </Badge>
                    <div className="text-right font-semibold">{formatCurrency(order.totalAmount)}</div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};


export default OrderList;