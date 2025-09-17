import { BASE_URL } from '@/config/api';
import { PagedResult } from '@/utils/pagedResult';

export interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  isActive: boolean;
  expiresAt: string;
}

export interface CreateCouponRequest {
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  expiresAt: string;
}

export interface UpdateCouponRequest {
  type?: 'fixed' | 'percent';
  value?: number;
  isActive?: boolean;
  expiresAt?: string;
}

export const couponService = {
  // Listar cupons (paginado)
  async getAll(page: number = 1, pageSize: number = 20): Promise<PagedResult<Coupon>> {
    try {
      const response = await fetch(`${BASE_URL}/api/Coupons?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Erro ao buscar cupons');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      return { items: [], totalCount: 0, page, pageSize };
    }
  },

  // Buscar cupom pelo código
  async getByCode(code: string): Promise<Coupon | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Coupons/code/${encodeURIComponent(code)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cupom por código:', error);
      return null;
    }
  },

  // Consultar cupom por ID
  async getById(id: number): Promise<Coupon | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Coupons/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cupom:', error);
      return null;
    }
  },

  // Registrar novo cupom
  async create(coupon: CreateCouponRequest): Promise<Coupon | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
      });
      if (!response.ok) throw new Error('Erro ao criar cupom');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar cupom:', error);
      return null;
    }
  },

  // Editar cupom
  async update(id: number, coupon: UpdateCouponRequest): Promise<Coupon | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
      });
      if (!response.ok) throw new Error('Erro ao atualizar cupom');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error);
      return null;
    }
  },

  // Excluir cupom
  async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/Coupons/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao excluir cupom:', error);
      return false;
    }
  }
};