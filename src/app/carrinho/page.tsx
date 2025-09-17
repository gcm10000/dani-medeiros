"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } = useCart();
  const deliveryFee = 8.00;
  const total = getTotal();
  const finalTotal = total + (total > 0 ? deliveryFee : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    toast({
      title: "Produto removido",
      description: `${productName} foi removido do seu carrinho.`,
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-foreground mb-4 font-dancing">
              Seu carrinho está vazio
            </h1>
            <p className="text-muted-foreground mb-8">
              Que tal explorar nosso delicioso cardápio e adicionar alguns doces especiais?
            </p>
            <Link href="/cardapio">
              <Button size="lg" variant="hero">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ver Cardápio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cardapio">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground font-dancing">
              Seu Carrinho
            </h1>
            <p className="text-muted-foreground">
              {getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'} selecionados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product.id} className="shadow-card border-primary/10">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                      <img 
                        src={item.product.images?.[0]?.url} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-card border-primary/10 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Resumo do Pedido
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span className="font-medium">{formatPrice(deliveryFee)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
                
                <Link href="/checkout" className="block mt-6">
                  <Button variant="hero" size="lg" className="w-full">
                    Finalizar Pedido
                  </Button>
                </Link>
                
                <Link href="/cardapio" className="block mt-3">
                  <Button variant="outline" className="w-full">
                    Continuar Comprando
                  </Button>
                </Link>
                
                <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    🚚 <strong>Entrega grátis</strong> para pedidos acima de R$ 50,00
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;