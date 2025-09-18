"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { productSalesService, ProductSale, CreateProductSaleRequest, UpdateProductSaleRequest } from '@/services/productSalesService';
import { productService, AdminProduct } from '@/services/productService';
import { couponService, Coupon } from '@/services/couponService';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ProductSales = () => {
  const [sales, setSales] = useState<ProductSale[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  
  const [formData, setFormData] = useState<{
    products: { productId: number; quantity: number }[];
    totalPrice: number;
    couponCode: string;
  }>({
    products: [{ productId: 0, quantity: 1 }],
    totalPrice: 0,
    couponCode: ''
  });

  const { toast } = useToast();
  const router = useRouter();

  const loadSales = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await productSalesService.getAll(page, pageSize);
      setSales(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(Math.ceil(result.totalCount / pageSize));
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar vendas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const data = await productService.getAllAdmin();
    setProducts(data);
  };

  const loadCoupons = async () => {
    const result = await couponService.getAll(1, 10); // Buscar todos os cupons
    // Normaliza o campo type para o tipo correto
    setCoupons(result.items.map(c => ({
      ...c,
      type: c.type && c.type.toLowerCase() === 'percent' ? 'percent' : 'fixed'
    })));
  };

  useEffect(() => {
    loadSales();
    loadProducts();
    loadCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const updateData: UpdateProductSaleRequest = {
          products: formData.products,
          totalPrice: formData.totalPrice,
          couponCode: formData.couponCode ? formData.couponCode : undefined
        };
        await productSalesService.update(editingId, updateData);
        toast({
          title: "Sucesso",
          description: "Venda atualizada com sucesso!",
        });
      } else {
        const createData: CreateProductSaleRequest = {
          products: formData.products,
          totalPrice: formData.totalPrice,
          couponCode: formData.couponCode ? formData.couponCode : undefined
        };
        await productSalesService.create(createData);
        toast({
          title: "Sucesso",
          description: "Venda registrada com sucesso!",
        });
      }
      setEditingId(null);
      setFormData({
        products: [{ productId: 0, quantity: 1 }],
        totalPrice: 0,
        couponCode: ''
      });
      loadSales(currentPage);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${editingId ? 'atualizar' : 'registrar'} venda`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (sale: ProductSale) => {
    router.push(`/admin/vendas/${sale.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await productSalesService.delete(id);
      toast({
        title: "Sucesso",
        description: "Venda excluída com sucesso!",
      });
      loadSales(currentPage);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir venda",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Produto não encontrado';
  };

  const calculateTotal = () => {
    let subtotal = 0;
    formData.products.forEach(item => {
      const selectedProduct = products.find(p => p.id === item.productId);
      if (selectedProduct) {
        subtotal += selectedProduct.price * item.quantity;
      }
    });
    // Aplicar desconto do cupom se houver
    const selectedCoupon = coupons.find(c => c.code === formData.couponCode);
    let discount = 0;
    if (selectedCoupon) {
      if (selectedCoupon.type === 'percent') {
        discount = subtotal * (selectedCoupon.value / 100);
      } else {
        discount = selectedCoupon.value;
      }
    }
    const total = Math.max(0, subtotal - discount);
    setFormData(prev => ({ ...prev, totalPrice: total }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.products, formData.couponCode, products, coupons]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Vendas Presenciais</h1>
            <p className="text-muted-foreground">Gerencie as vendas realizadas presencialmente e acompanhe o histórico</p>
        </div>
        <Button onClick={() => router.push('/admin/vendas/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Cupom</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.id}</TableCell>
                      <TableCell>
                        {(sale.products ?? []).map((p, idx) => (
                          <div key={idx}>
                            {p.productName} x {p.quantity} ({formatCurrency(p.unitPrice)})
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {(sale.products ?? []).reduce((sum, p) => sum + p.quantity, 0)}
                      </TableCell>
                      <TableCell>{formatCurrency(sale.totalPrice)}</TableCell>
                      <TableCell>{formatCurrency(sale.discount)}</TableCell>
                      <TableCell>{sale.couponCode || '-'}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(sale)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação da lista de vendas */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(p => Math.max(1, p - 1));
                      loadSales(currentPage - 1);
                    }
                  }}
                  disabled={currentPage === 1}
                >
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  Anterior
                </Button>
                <span>
                  Página {currentPage} de {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      loadSales(currentPage + 1);
                    }
                  }}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Próxima
                  <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                ({totalCount} vendas no total)
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSales;