import { BASE_URL } from "@/config/api";
import { PagedResult } from "@/utils/pagedResult";

export interface StockItemRequest {
  name: string;
  unit: string;
  minimumQuantity: number;
  maximumQuantity: number;
  costType: string;
}

export interface AddRemoveStockRequest {
  lots: number;
  quantityPerLot: number;
  totalCost: number;
}


export interface StockItemResponse {
  id: number;
  name: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity: number;
  costType: string;
  stockMovements: StockMovementResponse[];
  officialPriceHistory: OfficialPriceHistoryResponse[];
  officialPriceHistoryOfficialPackagePrice: number;
  officialPriceHistoryQuantity: number;
  officialPriceHistoryUnitPrice: number;
  officialPriceHistoryUnit: number;
}

export interface RecipeStockItemDto {
  refId: string;
  name: string;
  unit: string | null;
  costType: string | null;
  type: "StockItem" | "Recipe";
  unitCost: number | null;
}


export interface OfficialPriceHistoryResponse {
  id: number;
  officialPackagePrice: number;
  quantity: number;
  unitPrice: number;
  unit: number;
  createdAt: string;
}

export interface StockMovementResponse {
  id: number;
  lots: number;
  quantityPerLot: number;
  movementQuantity: number;
  totalCost: number;
  currentQuantity: number;
  reason: string;
  type: string;
  createdAt: string;
}

export const stockItemService = {
  async getAll(page = 1, pageSize = 10, search = '') {
    const params = new URLSearchParams({ Page: String(page), PageSize: String(pageSize) });
    if (search) params.append("Search", search);
    const response = await fetch(`${BASE_URL}/api/StockItems?${params.toString()}`);
    if (!response.ok) throw new Error("Erro ao buscar insumos");
    return await response.json();
  },

  async getById(id: number): Promise<StockItemResponse | null> {
    const response = await fetch(`${BASE_URL}/api/StockItems/${id}`);
    if (!response.ok) return null;
    return await response.json();
  },

  
  async getRecipeStockItems(page = 1, pageSize = 10, search = ''): Promise<PagedResult<RecipeStockItemDto>> {
      const params = new URLSearchParams({ Page: String(page), PageSize: String(pageSize) });
      if (search) params.append("Search", search);
      const response = await fetch(`${BASE_URL}/api/StockItems/GetRecipeStockItems?${params.toString()}`);
      if (!response.ok) throw new Error('Erro ao buscar receitas');
      const result = await response.json();
      return result;
  },

  async create(data: StockItemRequest): Promise<StockItemResponse | null> {
    const response = await fetch(`${BASE_URL}/api/StockItems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar insumo');
    return await response.json();
  },

  async update(id: number, data: StockItemRequest): Promise<StockItemResponse | null> {
    const response = await fetch(`${BASE_URL}/api/StockItems/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar insumo');
    return await response.json();
  },

  async delete(id: number): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/api/StockItems/${id}`, { method: 'DELETE' });
    return response.ok;
  },

  // Adicionar nova entrada de estoque
  async addStock(id: number, data: AddRemoveStockRequest): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/api/StockItems/${id}/add-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  },
  
  // Adicionar nova entrada de estoque
  async removeStock(id: number, data: AddRemoveStockRequest): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/api/StockItems/${id}/remove-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  }
};
