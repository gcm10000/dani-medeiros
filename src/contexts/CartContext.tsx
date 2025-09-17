"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from "react";
import { CartItem, Product, CartContextType } from "@/types/cart";

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" };

interface CartState {
  items: CartItem[];
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM":
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === action.product.id
      );

      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += 1;
        return { items: updatedItems };
      }

      return { items: [...state.items, { product: action.product, quantity: 1 }] };

    case "REMOVE_ITEM":
      return {
        items: state.items.filter((item) => item.product.id !== action.productId),
      };

    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return {
          items: state.items.filter((item) => item.product.id !== action.productId),
        };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === action.productId ? { ...item, quantity: action.quantity } : item
        ),
      };

    case "CLEAR_CART":
      return { items: [] };

    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = "bakery-cart";

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    // lazy initializer seguro para SSR
    if (typeof window !== "undefined") {
      try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) return JSON.parse(storedCart);
      } catch (error) {
        console.error("Erro ao carregar carrinho do localStorage:", error);
      }
    }
    return { items: [] };
  });

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // salva sempre que o estado muda (apenas client-side)
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Erro ao salvar carrinho no localStorage:", error);
    }
  }, [state]);

  if (!hydrated) return null; // não renderiza nada até hidratar

  const addItem = (product: Product) => dispatch({ type: "ADD_ITEM", product });
  const removeItem = (productId: string) => dispatch({ type: "REMOVE_ITEM", productId });
  const updateQuantity = (productId: string, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const getTotal = () =>
    state.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const getItemCount = () => state.items.reduce((count, item) => count + item.quantity, 0);

  const value: CartContextType = {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
