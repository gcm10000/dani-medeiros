import { BASE_URL } from '@/config/api';

export interface RecipeDetailsDto {
  id: number;
  name: string;
  yieldQuantity: number;
  notes?: string;
  items: RecipeItem[];
  totalCost?: number;
}

export interface RecipeItem {
  stockItemId: number;
  quantity: number;
  stockItemName: string;
  unit: string;
  costType: string;
  unitCost: number;
  proportionalCost: number;
}

export interface RecipeItemForm {
  refId: string;
  refName: string;
  quantity: number;
  costType?: string | null;
  unit?: string | null;
  unitCost?: number | null;
  proportionalCost?: number;
}

export interface RecipeFormData {
  name: string;
  yieldQuantity: number;
  notes: string;
  items: RecipeItemForm[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const recipeService = {
  // Buscar todas as receitas
  async getAll(): Promise<RecipeDetailsDto[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/Recipes`);
      if (!response.ok) throw new Error('Erro ao buscar receitas');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      return [];
    }
  },

  // Buscar receita por ID
  async getById(id: number): Promise<RecipeDetailsDto | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Recipes/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar receita:', error);
      return null;
    }
  },

  // Criar nova receita
  async create(recipe: Omit<RecipeFormData, 'id'>): Promise<RecipeFormData | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      });
      if (!response.ok) throw new Error('Erro ao criar receita');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      return null;
    }
  },

  // Atualizar receita
  async update(id: number, recipe: Omit<RecipeFormData, 'id'>): Promise<boolean> {
      const response = await fetch(`${BASE_URL}/api/Recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      });

      return response.ok;
  },

  // Excluir receita
  async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/Recipes/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      return false;
    }
  },

  // Salvar snapshot de precificação
  async saveSnapshot(recipeId: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/RecipePricing/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao salvar snapshot:', error);
      return false;
    }
  },

  // Buscar receitas paginadas
  async getPaged(page: number = 1, pageSize: number = 20): Promise<PagedResult<RecipeDetailsDto>> {
    try {
      const response = await fetch(`${BASE_URL}/api/Recipes?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Erro ao buscar receitas paginadas');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar receitas paginadas:', error);
      return { items: [], totalCount: 0, page, pageSize };
    }
  }
};