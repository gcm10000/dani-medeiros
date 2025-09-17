import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/cart';

interface AddToCartModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, notes?: string) => void;
}

export const AddToCartModal: React.FC<AddToCartModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'bolo':
        return 'bg-primary/20 text-primary';
      case 'cupcake':
        return 'bg-accent/20 text-accent-foreground';
      case 'doce':
        return 'bg-warm-brown/20 text-warm-brown';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity, notes.trim() || undefined);
      setQuantity(1);
      setNotes('');
      onClose();
    }
  };

  const handleClose = () => {
    setQuantity(1);
    setNotes('');
    onClose();
  };

  if (!product) return null;

  const totalPrice = product.price * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-dancing text-2xl">
            Adicionar ao Carrinho
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img 
                src={product.images[0].url} 
                alt={product.name}
                className="w-20 h-20 rounded-lg object-cover shadow-soft"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">
                  {product.name}
                </h3>
                <Badge className={`text-xs ${getCategoryBadgeColor(product.category)}`}>
                  {product.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {product.description}
              </p>
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                id="quantity"
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= 99) {
                    setQuantity(value);
                  }
                }}
                className="text-center w-20"
              />
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>


          {/* Total Price */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddToCart}
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar ({quantity})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};