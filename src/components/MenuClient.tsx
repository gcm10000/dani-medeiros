"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { AddToCartModal } from "@/components/AddToCartModal";
import ImageCarousel from "@/components/ImageCarousel";
import { Product } from "@/types/cart";
import { productService } from "@/services/productService";

interface MenuClientProps {
  initialCategories: Category[];
  initialProducts: PagedResult<Product>;
}


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


import { useEffect, useCallback } from "react";
import { categoryService } from "@/services/categoryService";
import { PagedResult } from "@/utils/pagedResult";

type Category = { id: string; name: string };

export function MenuClient({ initialCategories, initialProducts }: MenuClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<PagedResult<Product>>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carouselIndexes, setCarouselIndexes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const { addItem } = useCart();

  // Buscar produtos no client só quando mudar categoria ou apertar Enter no search
  const fetchProducts = useCallback(async (category: string, search: string) => {
    setLoading(true);
    try {
      const result = await productService.getMenuProducts({
        categoryId: category === "all" ? undefined : Number(category),
        search: search.trim() || undefined,
      });
      setProducts(result);
    } catch {
      setProducts({ items: [], totalCount: 0, page: 1, pageSize: 0});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory !== "all" || searchTerm.trim()) {
      fetchProducts(selectedCategory, searchTerm);
    }
  }, [selectedCategory, fetchProducts]);

  // Handler para Enter no input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchProducts(selectedCategory, searchTerm);
    }
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product: Product, quantity: number, notes?: string) => {
    for (let i = 0; i < quantity; i++) {
      addItem({ ...product, notes });
    }
    toast({
      title: "Produto adicionado!",
      description: `${quantity}x ${product.name} ${
        quantity > 1 ? "foram adicionados" : "foi adicionado"
      } ao seu carrinho.`,
    });
  };

  const handleCarouselIndexChange = (productId: string, index: number) => {
    setCarouselIndexes((prev) => ({ ...prev, [productId]: index }));
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4 font-dancing">
            Nosso Cardápio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra nossa seleção especial de bolos e doces artesanais, 
            feitos com ingredientes frescos e muito carinho.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
              >
                <Filter className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Carregando produtos...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {products.items.map((product) => (
                <Card key={product.id} className="group overflow-hidden shadow-card hover:shadow-elegant transition-smooth border-primary/10 hover:border-primary/20">
                  <div className="aspect-square overflow-hidden">
                    <ImageCarousel
                      images={Array.isArray(product.images) ? product.images : []}
                      className="hover:scale-105 transition-smooth"
                      currentIndex={carouselIndexes[String(product.id)] ?? 0}
                      setCurrentIndex={(index) =>
                        handleCarouselIndexChange(String(product.id), index)
                      }
                      onRemoveImage={() => {}}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth">
                        {product.name}
                      </h3>
                      <Badge className={`text-xs ${getCategoryBadgeColor(product.category)}`}>
                        {product.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleOpenModal(product)}
                        className="hover:scale-105 transition-bounce"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.items.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍰</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-16 p-8 gradient-card rounded-2xl shadow-soft">
          <h2 className="text-2xl font-bold text-foreground mb-4 font-dancing">
            Não encontrou o que procurava?
          </h2>
          <p className="text-muted-foreground mb-6">
            Entre em contato conosco para pedidos personalizados e sabores especiais!
          </p>
          <Button 
            variant="whatsapp" 
            size="lg"
            onClick={() => window.open('https://wa.me/5521959051443?text=Olá! Gostaria de fazer um pedido personalizado.', '_blank')}
          >
            Fazer Pedido Personalizado
          </Button>
        </div>

        <AddToCartModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
}
