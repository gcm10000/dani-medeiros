// app/pix-payment/[orderId]/page.tsx
import { orderService } from '@/services/orderService';
import PixPaymentClient from './PixPaymentClient';

export default async function PixPaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params; // <- precisa do await aqui
  const orderIdNumber = parseInt(orderId);

  const orderData = await orderService.getOrderById(orderIdNumber);
  
  return (
    <PixPaymentClient orderId={orderIdNumber} orderData={orderData} />
  );
}
