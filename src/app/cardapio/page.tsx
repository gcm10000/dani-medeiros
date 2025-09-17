import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import { productService } from "@/services/productService";
import { Product } from "@/types/cart";
import ImageCarousel from "@/components/ImageCarousel";
import { AddToCartModal } from "@/components/AddToCartModal";
import { MenuClient } from "@/components/MenuClient";
import { categoryService } from "@/services/categoryService";

// Indica que este componente será renderizado no servidor
export const revalidate = 0; // opcional: força SSR a cada request

interface MenuPageProps {}

const categories = [
  { id: "all", name: "Todos" },
  { id: "bolo", name: "Bolos" },
  { id: "cupcake", name: "Cupcakes" },
  { id: "doce", name: "Doces" },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    price
  );

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case "bolo":
      return "bg-primary/20 text-primary";
    case "cupcake":
      return "bg-accent/20 text-accent-foreground";
    case "doce":
      return "bg-warm-brown/20 text-warm-brown";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default async function MenuPage({}: MenuPageProps) {
    // Fetch categorias no server
  const apiCategories = await categoryService.getAll();
  const categories = [
    { id: "all", name: "Todos" },
    ...(apiCategories.map((category) => ({ id: String(category.id), name: category.name })) || []),
  ];

  // ✅ Fetch feito no servidor
  const products = await productService.getMenuProducts({});

  return (
    <MenuClient
      initialCategories={categories} 
      initialProducts={products} 
    />
  );
}
