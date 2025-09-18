import { BASE_URL } from '@/config/api';
import { PagedResult } from '@/utils/pagedResult';


export interface ProductSaleProduct {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface ProductSale {
  id: number;
  products: ProductSaleProduct[];
  totalPrice: number;
  discount: number;
  couponCode?: string | null;
  date: string;
}


export interface CreateProductSaleRequest {
  products: { productId: number; quantity: number }[];
  totalPrice: number;
  couponCode?: string;
}


export interface UpdateProductSaleRequest {
  products: { productId: number; quantity: number }[];
  totalPrice: number;
  couponCode?: string;
}

export const productSalesService = {
  // Listar vendas (paginado)
  async getAll(page: number = 1, pageSize: number = 20): Promise<PagedResult<ProductSale>> {
    try {
      const response = await fetch(`${BASE_URL}/api/ProductSales?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Erro ao buscar vendas');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      return { items: [], totalCount: 0, page, pageSize };
    }
  },

  // Consultar venda por ID
  async getById(id: number): Promise<ProductSale | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/ProductSales/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      return null;
    }
  },

  // Registrar nova venda
  async create(sale: CreateProductSaleRequest): Promise<ProductSale | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/ProductSales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale)
      });
      if (!response.ok) throw new Error('Erro ao criar venda');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      return null;
    }
  },

  // Editar venda
  async update(id: number, sale: UpdateProductSaleRequest): Promise<ProductSale | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/ProductSales/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale)
      });
      if (!response.ok) throw new Error('Erro ao atualizar venda');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      return null;
    }
  },

  // Excluir venda
  async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/ProductSales/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      return false;
    }
  }
};