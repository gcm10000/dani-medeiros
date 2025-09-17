import { ProductImage } from "@/services/productService";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images?: ProductImage[];
  category: 'bolo' | 'cupcake' | 'doce';
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}