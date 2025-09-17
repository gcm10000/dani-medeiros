import { BASE_URL } from '@/config/api';
import { Product } from '@/types/cart';
import chocolateCake from '@/assets/chocolate-cake.jpg';

interface APIProduct {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
}

const mapCategoryName = (categoryName: string): 'bolo' | 'cupcake' | 'doce' => {
  const lowerCategory = categoryName.toLowerCase();
  if (lowerCategory.includes('bolo')) return 'bolo';
  if (lowerCategory.includes('cupcake')) return 'cupcake';
  return 'doce';
};

export interface AdminProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  stockMovements: StockMovement[];
  isActive: boolean;
  images: ProductImage[];
  description?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

export interface StockMovement {
  id: number;
  stockItemId?: number;
  stockItemName?: string;
  productStockId: number;
  productName: string;
  type: string;
  reason: string;
  currentQuantity: number;
  movementQuantity: number;
  createdAt: string;
}

export const productService = {
  // Remover imagem de produto por ID
  async deleteImage(productId: number | string, imageId: number): Promise<boolean> {
      const response = await fetch(`${BASE_URL}/api/Products/${productId}/delete-image/${imageId}`, {
        method: 'DELETE'
      });
      return response.ok;
  },
  // Buscar todos os produtos
  
  // async fetchProducts(): Promise<Product[]> {
  //   try {
  //     console.log('Iniciando busca de produtos...');
  //     const response = await fetch(`${BASE_URL}/api/Products`);
  //     console.log('Response status:', response.status);
      
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
      
  //     const apiProducts: APIProduct[] = await response.json();
  //     console.log('Dados da API recebidos:', apiProducts);
      
  //     const mappedProducts = apiProducts.map(product => ({
  //       id: product.id.toString(),
  //       name: product.name,
  //       description: `Delicioso ${product.name.toLowerCase()}`,
  //       price: product.price,
  //       image: chocolateCake, // Imagem padrão para todos os produtos
  //       category: mapCategoryName(product.categoryName),
  //     }));
      
  //     console.log('Produtos mapeados:', mappedProducts);
  //     return mappedProducts;
  //   } catch (error) {
  //     console.error('Erro ao buscar produtos:', error);
  //     return [];
  //   }
  // },

  // Admin: Buscar todos os produtos
  async getAllAdmin(): Promise<AdminProduct[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/Products`);
      if (!response.ok) throw new Error('Erro ao buscar produtos');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  },

  // Admin: Buscar produto por ID
  async getByIdAdmin(id: number): Promise<AdminProduct | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Products/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  },

  // Admin: Criar novo produto
  async create(product: Omit<AdminProduct, 'id'>): Promise<AdminProduct | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Erro ao criar produto');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return null;
    }
  },

  // Admin: Atualizar produto
  async update(id: number, product: Omit<AdminProduct, 'id'>): Promise<AdminProduct | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Erro ao atualizar produto');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return null;
    }
  },

  // Admin: Excluir produto
  async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/Products/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      return false;
    }
  },

  // Admin: Adicionar quantidade ao estoque
  async addStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/ProductStocks/add-quantity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao adicionar estoque:', error);
      return false;
    }
  },

  // Admin: Ajustar estoque manualmente
  async adjustStock(productId: number, newQuantity: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/ProductStocks/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, newQuantity })
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      return false;
    }
  },

  // Admin: Atualizar status de disponibilidade (ativo/inativo)
  async setActiveStatus(id: number, isActive: boolean): Promise<AdminProduct | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/Products/${id}/active?isActive=${isActive}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Erro ao atualizar status do produto');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar status do produto:', error);
      return null;
    }
  },

  // Buscar produtos ativos para o cardápio público
  async getMenuProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/Products/menu`);
      if (!response.ok) throw new Error('Erro ao buscar produtos do cardápio');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos do cardápio:', error);
      return [];
    }
  },
  async uploadImage(productId: number | string, file: File): Promise<ProductImage> {
    // const myHeaders = new Headers();
    // Não defina Content-Type manualmente para FormData, o browser faz isso automaticamente
    // myHeaders.append("Content-Type", "multipart/form-data");

    const formdata = new FormData();
    formdata.append("image", file, file.name);

    const requestOptions: RequestInit = {
      method: "POST",
      // headers: myHeaders,
      body: formdata
    };

    const response = await fetch(`${BASE_URL}/api/Products/${productId}/upload-image`, requestOptions);
    if (!response.ok) throw new Error('Erro ao enviar imagem');
    const data = await response.json();
    return data;
  },
  // Definir imagem principal do produto
  async setMainImage(productId: number | string, imageId: number): Promise<ProductImage[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/Products/${productId}/set-main-image/${imageId}`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Erro ao definir imagem principal');
      return await response.json();
    } catch (error) {
      console.error('Erro ao definir imagem principal:', error);
      throw error;
    }
  }
};