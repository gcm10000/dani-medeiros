"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Package, CheckCircle, Truck, User, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import Timeline from './Timeline';
import { AdminOrder, OrderStatus } from '@/services/orderService';
import { useState } from 'react';
import { Skeleton } from '../ui/skeleton';

interface OrderDetailsProps {
  order: AdminOrder | null;
  loading: boolean;
  liveStatus: number | null;
  isConnected: boolean;
  onMarkAsConfirmed: (id: number) => void;
  onMarkOrderReady: (id: number) => void;
  onMarkOrderOnTheWay: (id: number) => void;
  onMarkAsDelivered: (id: number) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order: selectedOrder,
  loading,
  liveStatus,
  isConnected,
  onMarkAsConfirmed,
  onMarkOrderReady,
  onMarkOrderOnTheWay,
  onMarkAsDelivered
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleOrderAction = (action: string, orderId: number) => {
    // Implementar ações do pedido (confirmar, cancelar, etc.)
    console.log(`Ação: ${action} para pedido: ${orderId}`);
  };


  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    // Remove tudo que não for número
    const cleaned = phone.replace(/\D/g, '');
    // Aplica máscara
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7,11)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6,10)}`;
    }
    return phone;
  };

  if (loading || !selectedOrder) {
    return (
      Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-100">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-16" />
      </div>
    )));
  }

  return (
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-32 w-full mt-2" />
          </div>
        ) : selectedOrder ? (
          <div className="flex-1 flex flex-col ml-4">

            {/* Timeline de Status */}
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Fluxo do Pedido
                </h2>
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between w-full">
                {[
                  { emoji: "✓", label: "Aguardando a confirmação", date: null },
                  { emoji: "👩", label: "Preparando seu pedido", date: null },
                  { emoji: "📦", label: "Pedido pronto para entrega", date: null },
                  { emoji: "🚚", label: "Saiu para entrega", date: null },
                  { emoji: "🍽️", label: "Pedido entregue", date: null },
                ].map((step, index, arr) => {
                  const statusIdx = liveStatus !== null ? liveStatus : selectedOrder.orderStatusId;
                  const isActive = index <= statusIdx;

                  const currentStepIndex = selectedOrder.orderStatusId;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center relative">
                      {/* Linha de conexão vinda da esquerda */}
                      {index > 0 && (
                        <div
                          className={`absolute top-1/2 left-0 right-1/2 h-1 -translate-y-1/2 ${
                            index <= currentStepIndex ? "bg-pink-600" : "bg-gray-300"
                          }`}
                          style={{ top: "20px" }} // força alinhar no centro da bolinha de 40px
                        />
                      )}

                      {/* Linha de conexão indo para a direita */}
                      {index < arr.length - 1 && (
                        <div
                          className={`absolute top-1/2 left-1/2 right-0 h-1 -translate-y-1/2 ${
                            index < currentStepIndex ? "bg-pink-600" : "bg-gray-300"
                          }`}
                          style={{ top: "20px" }} // idem aqui
                        />
                      )}


                      {/* Bolinha */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 text-xl border-2 ${
                          isActive
                            ? "bg-pink-600 border-pink-600 text-white"
                            : "bg-gray-200 border-gray-300 text-gray-500"
                        }`}
                      >
                        {step.emoji}
                      </div>

                      {/* Label */}
                      <div className="text-xs mt-2 text-center w-24">
                        {step.label}
                      </div>

                      {/* Hora */}
                      <div className="text-[10px] text-gray-500 mt-1">
                        {step.date ? format(new Date(step.date), "HH:mm") : "--:--"}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>


            <div className="p-6 bg-white border-b border-gray-200">
              <h1 className="text-2xl font-bold">Dados do Cliente</h1>
              <p className="text-gray-600">Informações fornecidas no momento do pedido</p>
              
              <div className="flex items-center space-x-4 mt-4 mb-4">

                <div className="flex items-center space-x-2">
                  <span className="font-mono font-semibold">Pedido #{selectedOrder.id}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">Feito às {formatTime(selectedOrder.createdAt)}</span>
                  <Badge variant="outline">Pelo Site</Badge>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Cliente: {selectedOrder.customerName}</span>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>Telefone: {formatPhone(selectedOrder.phoneNumber)}</span>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                      Pedido Criado em: {format(new Date(selectedOrder.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{selectedOrder.address}, {selectedOrder.number} - {selectedOrder.city} - {selectedOrder.neighborhood} - CEP {selectedOrder.zipCode}</span>
              </div>
            </div>

            <div className="flex-1 p-6 bg-white">
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{item.quantity}x</span>
                      <span>{item.productName}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.unitPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-base font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-base font-medium">
                  <span>Frete</span>
                  <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="p-6 bg-white border-t border-gray-200">
              <div className="flex space-x-3">
              {
                liveStatus === OrderStatus.Pending && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleOrderAction('cancel', selectedOrder.id)}
                    >
                    Cancelar
                  </Button>
                    <Button 
                    className="flex-1"
                    onClick={() => onMarkAsConfirmed(selectedOrder.id)}
                    >
                    Confirmar Pedido
                    </Button>
                  </>
                )
              }
              {
                OrderStatus.Preparing === liveStatus && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleOrderAction('cancel', selectedOrder.id)}
                    >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => onMarkOrderReady(selectedOrder.id)}
                  >
                    Marcar como Pronto para Entrega
                  </Button>
                  </>
                )
              }
              {
                OrderStatus.Ready === liveStatus && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleOrderAction('cancel', selectedOrder.id)}
                    >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => onMarkOrderOnTheWay(selectedOrder.id)}
                  >
                    Marcar como Pedido a Caminho
                  </Button>
                  </>
                )
              }
              {
                OrderStatus.OnTheWay === liveStatus && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleOrderAction('cancel', selectedOrder.id)}
                    >
                    Cancelar
                  </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => onMarkAsDelivered(selectedOrder.id)}
                    >
                      Marcar como Entregue
                    </Button>
                  </>
                )
              }
              </div>
            </div>
            
          </div>
        ) : (
          <div className="flex-1 flex-col flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Selecione um pedido para ver os detalhes</h3>
            </div>
          </div>
        )}
      </div>
  );
};

export default OrderDetails;