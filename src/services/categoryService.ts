import { BASE_URL } from '@/config/api';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export const categoryService = {
  // Buscar todas as categorias
  async getAll(): Promise<Category[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/Categories`);
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  },

  // Buscar categoria por ID
  async getById(id: number): Promise<Category | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Categories/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return null;
    }
  },

  // Criar nova categoria
  async create(category: Omit<Category, 'id'>): Promise<Category | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
      if (!response.ok) throw new Error('Erro ao criar categoria');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return null;
    }
  },

  // Atualizar categoria
  async update(id: number, category: Omit<Category, 'id'>): Promise<Category | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
      if (!response.ok) throw new Error('Erro ao atualizar categoria');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return null;
    }
  },

  // Excluir categoria
  async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/Categories/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      return false;
    }
  }
};