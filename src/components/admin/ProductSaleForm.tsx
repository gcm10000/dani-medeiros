"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { productSalesService } from "@/services/productSalesService";
import { couponService, Coupon } from "@/services/couponService";
import { productService, AdminProduct } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSaleFormProps {
  params?: { id?: string };
}

const ProductSaleForm = ({ params }: ProductSaleFormProps) => {
  const id = params?.id;
  console.log("ID recebido no form:", id);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    products: { productId: number; quantity: number }[];
    totalPrice: number;
    couponCode: string;
  }>({
    products: [{ productId: 0, quantity: 1 }],
    totalPrice: 0,
    couponCode: "",
  });

  // Carrega cupons
  useEffect(() => {
    couponService.getAll(1, 100).then((result) => {
      setCoupons(
        result.items.map((c) => ({
          ...c,
          type: c.type?.toLowerCase() === "percent" ? "percent" : "fixed",
        }))
      );
    });
  }, []);

  // Carrega venda se estiver editando
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productSalesService.getById(Number(id)).then((sale) => {
      if (sale) {
        setFormData({
          products: sale.products.map((p) => ({ productId: p.productId, quantity: p.quantity })),
          totalPrice: sale.totalPrice,
          couponCode: sale.couponCode || "",
        });

        if (sale.couponCode && !coupons.some((c) => c.code === sale.couponCode)) {
          setCoupons((prev) => [
            { id: 0, code: sale.couponCode || "none", type: "fixed", value: 0, isActive: false, expiresAt: "" },
            ...prev,
          ]);
        }
      }
      setLoading(false);
    });
  }, [id, coupons]);

  // Carrega produtos
  useEffect(() => {
    productService.getAllAdmin().then(setProducts);
  }, []);

  // Calcula total
  const calculateTotal = () => {
    let subtotal = 0;
    formData.products.forEach((item) => {
      const selectedProduct = products.find((p) => p.id === item.productId);
      if (selectedProduct) subtotal += selectedProduct.price * item.quantity;
    });

    const selectedCoupon = coupons.find((c) => c.code === formData.couponCode);
    let discount = 0;
    if (selectedCoupon) {
      discount = selectedCoupon.type === "percent" ? subtotal * (selectedCoupon.value / 100) : selectedCoupon.value;
    }

    const total = Math.max(0, subtotal - discount);
    setFormData((prev) => ({ ...prev, totalPrice: total }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.products, formData.couponCode, products, coupons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await productSalesService.update(Number(id), formData);
        toast({ title: "Sucesso", description: "Venda atualizada com sucesso!" });
      } else {
        await productSalesService.create(formData);
        toast({ title: "Sucesso", description: "Venda registrada com sucesso!" });
      }
      router.push("/admin/vendas");
    } catch {
      toast({ title: "Erro", description: "Erro ao registrar venda", variant: "destructive" });
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

    if (loading) return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{id ? "Editar Venda Presencial" : "Nova Venda Presencial"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formData.products.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor={`product-${idx}`}>Produto</Label>
                  <Select
                    value={item.productId.toString()}
                    onValueChange={(value) => {
                      const newProducts = [...formData.products];
                      newProducts[idx].productId = parseInt(value);
                      setFormData((prev) => ({ ...prev, products: newProducts }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name} - {formatCurrency(p.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`quantity-${idx}`}>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const newProducts = [...formData.products];
                      newProducts[idx].quantity = parseInt(e.target.value) || 1;
                      setFormData((prev) => ({ ...prev, products: newProducts }));
                    }}
                    required
                  />
                </div>
                {formData.products.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        products: prev.products.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData((prev) => ({ ...prev, products: [...prev.products, { productId: 0, quantity: 1 }] }))
              }
            >
              Adicionar Produto
            </Button>

            <div>
              <Label htmlFor="coupon">Cupom (opcional)</Label>
              <Select
                value={formData.couponCode || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, couponCode: value === "none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cupom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">(Nenhum cupom)</SelectItem>
                  {coupons.map((c) => (
                    <SelectItem key={c.id} value={c.code || `coupon-${c.id}`}>
                      {c.code} - Desconto: {c.type === "percent" ? `${c.value}%` : formatCurrency(c.value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="totalPrice">Valor Total</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.totalPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, totalPrice: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              {id ? "Atualizar Venda" : "Registrar Venda"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSaleForm;
