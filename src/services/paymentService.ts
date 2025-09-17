import { BASE_URL, PAYMENT_BASE_URL } from '@/config/api';
import { toast } from '@/components/ui/use-toast';
import { savePixData, savePixDataRequest, savePixDataResponse } from '@/utils/pixDataStorage';

export const paymentService = {
  // Gerar pagamento PIX
  async generatePixPayment(orderData: any, idempotencyKey?: string) {
    const paymentData = {
    customerName: orderData.customerData.name,
    phoneNumber: orderData.customerData.phone,
    address: orderData.customerData.address,
    number: orderData.customerData.number,
    complement: orderData.customerData.complement || "",
    city: orderData.customerData.city,
    neighborhood: orderData.customerData.neighborhood,
    zipCode: orderData.customerData.zipCode,
    saleType: "Online", // ou outro valor conforme sua lógica
    notes: orderData.customerData.comments || "",
    paymentMethod: orderData.customerData.paymentMethod || "pix",
    couponCode: orderData.customerData.coupon || null,
    items: orderData.items.map((item: any) => ({
      productId: item.product.id,
      quantity: item.quantity
    }))
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idempotencyKey) 
    headers['X-Idempotency-Key'] = idempotencyKey;

  const response = await fetch(`${BASE_URL}/api/orders/pix`, {
    method: 'POST',
    headers,
    body: JSON.stringify(paymentData)
  });

  if (!response.ok) {
    throw new Error('Erro na requisição');
  }

  const apiResponse = await response.json();
  
  // const orderResponse = {
  //   orderId: apiResponse.order_id,
  //   orderName: apiResponse.order_name,
  //   qrCode: apiResponse.qr_code,
  //   qrCodeBase64: `data:image/png;base64,${apiResponse.qr_code_base64}`,
  //   shippingCost: apiResponse.shipping_cost,
  //   totalAmount: apiResponse.total_amount
  // };

  // savePixDataResponse(apiResponse.order_id, orderResponse);
  return apiResponse.order_id;
  },

  // Processar pagamento com cartão
  async processCardPayment(paymentPayload: any, idempotencyKey?: string) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
      const response = await fetch(`${BASE_URL}/api/orders/credit-card`, {
        method: "POST",
        headers,
        body: JSON.stringify(paymentPayload),
      });

      if (!response.ok) {
        throw new Error('Erro no pagamento');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};
