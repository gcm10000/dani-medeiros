// Configuração centralized da API
// export const BASE_URL = 'http://localhost:5113';
export const BASE_URL = 'https://danimedeiros-production.up.railway.app';
export const PAYMENT_BASE_URL = 'https://primary-production-2de4.up.railway.app';

// Status mappings baseados nos enums do backend
export const ORDER_STATUS = {
  pending: 0,
  preparing: 1,
  ready: 2,
  on_the_way: 3,
  delivered: 4,
  canceled_by_client: 5,
  canceled_by_vendor: 6,
  canceled_by_system: 7,
} as const;

export const PAYMENT_STATUS = {
  pending: 0,        // Pagamento iniciado, aguardando confirmação
  approved: 1,       // Pagamento aprovado
  declined: 2,       // Pagamento recusado
  refunded: 3        // Pagamento estornado
} as const;

export type OrderStatusType = keyof typeof ORDER_STATUS;
export type PaymentStatusType = keyof typeof PAYMENT_STATUS;