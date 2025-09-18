"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";

import { orderService, OrderSummary, AdminOrder, PaymentStatus, OrderStatus } from '@/services/orderService';
import { PagedResult } from '@/utils/pagedResult';
import { useAdminSse } from '@/contexts/AdminSseContext';
import { toast } from '@/hooks/use-toast';
import OrderList from './OrderList';
import OrderDetails from './OrderDetails';

const Order: React.FC = () => {
  const { newOrders, soundEnabled, enableSound } = useAdminSse() || {};
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [liveStatus, setLiveStatus] = useState<number | null>(null);
  const [pagedResult, setPagedResult] = useState<PagedResult<OrderSummary> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | null>(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<OrderStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId ? Number(params.orderId) : null;

  useEffect(() => { loadOrders(); }, [selectedPaymentStatus, selectedOrderStatus]);

  useEffect(() => {
    if (orderId) loadOrderDetail(Number(orderId));
    else setSelectedOrder(null);
  }, [orderId]);

    // Adiciona novos pedidos recebidos via SSE
  useEffect(() => {
    if (Array.isArray(newOrders) && newOrders.length > 0) {
      setOrders((prev) => {
        // Evita duplicidade por id
        const ids = new Set(prev.map(o => o.id));
        const onlyNew = newOrders.filter((o: any) => o && o.id && !ids.has(o.id));
        const result = [...onlyNew, ...prev];
        console.log('result', result);
        return result;
      });
    }
  }, [newOrders]);

  const loadOrders = async () => {
    setLoadingList(true);
    try {
      const data = await orderService.getAllAdmin(1, 20, searchTerm || undefined, selectedPaymentStatus ?? undefined, selectedOrderStatus ?? undefined);
      setPagedResult(data);
      setOrders(data.items);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os pedidos', variant: 'destructive' });
    } finally { setLoadingList(false); }
  };

  const loadOrderDetail = async (id: number) => {
    setLoadingDetail(true);
    try { const data = await orderService.getOrderById(id); setSelectedOrder(data); } 
    catch { toast({ title: 'Erro', description: 'Não foi possível carregar o pedido', variant: 'destructive' }); }
    finally { setLoadingDetail(false); }
  };

  const handleSelectOrder = (order: OrderSummary) => {
    router.push(`/admin/pedidos/${order.id}`);
    setLiveStatus(null);
  };

  const markAsConfirmed = async (orderId: number) => { await orderService.markAsConfirmed(orderId); };
  const markOrderReady = async (orderId: number) => { await orderService.markReady(orderId); };
  const markOrderOnTheWay = async (orderId: number) => { await orderService.markOnTheWay(orderId); };
  const markAsDelivered = async (orderId: number) => { await orderService.markDelivered(orderId); };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {!soundEnabled && (
        <button
          onClick={enableSound}
          className="fixed z-50 bottom-6 right-6 bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg font-bold text-lg animate-bounce hover:bg-pink-700 transition"
        >
          🔔 Ativar som de novos pedidos
        </button>
      )}

      <OrderList
        orders={orders}
        loading={loadingList}
        pagedResult={pagedResult}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedPaymentStatus={selectedPaymentStatus}
        setSelectedPaymentStatus={setSelectedPaymentStatus}
        selectedOrderStatus={selectedOrderStatus}
        setSelectedOrderStatus={setSelectedOrderStatus}
        onSelectOrder={handleSelectOrder}
        selectedOrderId={selectedOrder?.id || null}
        onSearch={loadOrders}
      />

      <OrderDetails
        order={selectedOrder}
        loading={loadingDetail}
        liveStatus={liveStatus}
        isConnected={isConnected}
        onMarkAsConfirmed={markAsConfirmed}
        onMarkOrderReady={markOrderReady}
        onMarkOrderOnTheWay={markOrderOnTheWay}
        onMarkAsDelivered={markAsDelivered}
      />
    </div>
  );
};

export default Order;