"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { couponService, Coupon, CreateCouponRequest, UpdateCouponRequest } from '@/services/couponService';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;
  
  const [formData, setFormData] = useState<CreateCouponRequest & { isActive?: boolean }>({
    code: '',
    type: 'fixed',
    value: 0,
    expiresAt: '',
    isActive: true
  });

  const { toast } = useToast();

  const loadCoupons = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await couponService.getAll(page, pageSize);
      setCoupons(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(Math.ceil(result.totalCount / pageSize));
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar cupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData: UpdateCouponRequest = {
          type: formData.type,
          value: formData.value,
          isActive: formData.isActive,
          expiresAt: formData.expiresAt
        };
        await couponService.update(editingId, updateData);
        toast({
          title: "Sucesso",
          description: "Cupom atualizado com sucesso!",
        });
      } else {
        const createData: CreateCouponRequest = {
          code: formData.code,
          type: formData.type,
          value: formData.value,
          expiresAt: formData.expiresAt
        };
        await couponService.create(createData);
        toast({
          title: "Sucesso",
          description: "Cupom criado com sucesso!",
        });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({
        code: '',
        type: 'fixed',
        value: 0,
        expiresAt: '',
        isActive: true
      });
      loadCoupons(currentPage);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${editingId ? 'atualizar' : 'criar'} cupom`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (coupon: Coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code || '',
      type: coupon.type && coupon.type.toLowerCase() === 'percent' ? 'percent' : 'fixed',
      value: coupon.value,
      expiresAt: coupon.expiresAt.split('T')[0],
      isActive: coupon.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await couponService.delete(id);
      toast({
        title: "Sucesso",
        description: "Cupom excluído com sucesso!",
      });
      loadCoupons(currentPage);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cupom",
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
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const formatDiscount = (type: 'fixed' | 'percent', value: number) => {
    if (type.toLocaleLowerCase() === 'fixed') return formatCurrency(value);
    return `${value}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cupons</h1>
          <p className="text-muted-foreground">Gerencie os cupons de desconto e promoções</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setFormData({
                code: '',
                type: 'fixed',
                value: 0,
                expiresAt: '',
                isActive: true
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Código do Cupom</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="Ex: PROMO10"
                  disabled={!!editingId}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Cupom</Label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="type"
                      value="fixed"
                      checked={formData.type === 'fixed'}
                      onChange={() => setFormData(prev => ({ ...prev, type: 'fixed', value: 0 }))}
                    />
                    <span>Nominal (R$)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="type"
                      value="percent"
                      checked={formData.type === 'percent'}
                      onChange={() => setFormData(prev => ({ ...prev, type: 'percent', value: 0 }))}
                    />
                    <span>Percentual (%)</span>
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="value">{formData.type === 'fixed' ? 'Valor do Desconto (R$)' : 'Percentual de Desconto (%)'}</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Data de Expiração</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt.replace('T23:59:59Z', '')}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value + 'T23:59:59Z' }))}
                  required
                />
              </div>
              {editingId && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Cupom ativo</Label>
                </div>
              )}
              <Button type="submit" className="w-full">
                {editingId ? 'Atualizar' : 'Criar'} Cupom
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
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
                    <TableHead>Código</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>{coupon.id}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>{formatDiscount(coupon.type, coupon.value)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge variant={coupon.isActive ? "default" : "secondary"}>
                            {coupon.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                          {isExpired(coupon.expiresAt) && (
                            <Badge variant="destructive" className="text-xs">
                              Expirado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(coupon.expiresAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(coupon)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o cupom "{coupon.code}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(coupon.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(p => Math.max(1, p - 1));
                      loadCoupons(currentPage - 1);
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
                      loadCoupons(currentPage + 1);
                    }
                  }}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Próxima
                  <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                ({totalCount} cupons no total)
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Coupons;