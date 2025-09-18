"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Save } from 'lucide-react';
import { recipeService } from '@/services/recipeService';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import StockItemSelect from '@/components/admin/StockItemSelect';
import { getCostTypeMap } from '@/utils/stockMovements';

interface RecipeDetailsProps {
  params: Promise<{
    recipeId: string;
  }>;
}

const RecipeDetails = ({ params }: RecipeDetailsProps) => {  
  const { recipeId } = React.use(params as unknown as React.Usable<{ recipeId: string }>);
  
  const router = useRouter();

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    yieldQuantity: 1,
  });

  const [editingItems, setEditingItems] = useState<any[]>([]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        const data = await recipeService.getById(Number(recipeId));
        if (data) {
          setRecipe(data);
          setFormData({
            name: data.name,
            notes: data.notes || '',
            yieldQuantity: data.yieldQuantity ?? 1,
          });
          setEditingItems(data.items || []);
        }
      } catch (err) {
        console.error(err);
        toast({ title: 'Erro ao carregar receita', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [recipeId]);

  const handleDeleteRecipe = async () => {
    if (!confirm('Deseja realmente apagar esta receita?')) return;
    const success = await recipeService.delete(Number(recipeId));
    if (success) {
      toast({ title: 'Receita apagada com sucesso!' });
      router.push('/admin/receitas');
    } else {
      toast({ title: 'Erro ao apagar receita', variant: 'destructive' });
    }
  };

  const handleUpdateItem = (index: number, updates: any) => {
    setEditingItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleAddItem = () => {
    setEditingItems(prev => [
      ...prev,
      {
        refId: '',
        refName: '',
        type: 'StockItem',
        quantity: 0,
        costType: 'Ingredient',
        unit: '',
        unitCost: 0,
        proportionalCost: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setEditingItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    try {
      setSaving(true);

      console.log('editingItems', editingItems);
      const payload = {
        name: formData.name,
        notes: formData.notes,
        yieldQuantity: formData.yieldQuantity,
        items: editingItems.map(i => ({
          refId: i.refId || i.id, // garante que refId seja preenchido
          refName: i.refName || i.name,
          type: i.type,
          quantity: i.quantity,
        })),
      };

      const updateResult = await recipeService.update(recipe.id, payload);

      if (!updateResult) throw new Error('Erro ao atualizar receita');

      toast({ title: 'Receita atualizada com sucesso!' });

      // recarrega
      const updated = await recipeService.getById(recipe.id);
      if (updated) {
        setRecipe(updated);
        setFormData({
          name: updated.name,
          notes: updated.notes || '',
          yieldQuantity: updated.yieldQuantity ?? 1,
        });
        setEditingItems(updated.items || []);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao salvar receita', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!recipe) return <p>Receita não encontrada.</p>;

  const totalCost = editingItems
    .reduce((acc, it) => acc + (it.unitCost * it.quantity), 0);

  const unitCost = formData.yieldQuantity > 0 ? totalCost / formData.yieldQuantity : 0;

  return (
    <div className="space-y-6">
      {/* Detalhes da Receita */}
      <Card>
        <CardHeader className="flex justify-between items-left">
          <CardTitle>Detalhes da Receita</CardTitle>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleDeleteRecipe}>
              <Trash className="h-4 w-4 mr-1" /> Apagar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                />
              </div>
              <div className="w-40">
                <Label htmlFor="yieldQuantity">Rendimento</Label>
                <Input 
                  id="yieldQuantity" 
                  type="number" 
                  min={1} 
                  value={formData.yieldQuantity} 
                  onChange={(e) => setFormData(prev => ({ ...prev, yieldQuantity: parseInt(e.target.value) || 1 }))} 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea 
                id="notes" 
                value={formData.notes} 
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens da Receita */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center w-full">
          <div className="flex-1">
            <CardTitle>Itens da Receita</CardTitle>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo Unitário (R$)</TableHead>
                <TableHead>Custo Proporcional (R$)</TableHead>
                <TableHead>Tipo de Custo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {editingItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="w-64">
                    <StockItemSelect
                      value={item.refId}
                      selectedName={item.refName || item.name}
                      selectedUnit={item.unit ?? ''}
                      selectedUnitCost={item.unitCost ?? 0}
                      onChange={(id, name, unit, unitCost, type) =>
                        handleUpdateItem(index, {
                          refId: id,
                          refName: name,
                          unit,
                          unitCost,
                          type,
                        })
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity ?? 0}
                      min={0}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        handleUpdateItem(index, { quantity: val });
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {item.unitCost != null ? formatCurrency(item.unitCost) : '-'}
                  </TableCell>

                  <TableCell>
                    {item.unitCost != null && item.quantity != null
                      ? formatCurrency(item.unitCost * item.quantity)
                      : '-'}
                  </TableCell>

                  <TableCell>
                    {item.type === 'StockItem' ? getCostTypeMap(item.costType) : 'Receita'}
                  </TableCell>

                  <TableCell className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleRemoveItem(index)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveRecipe} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? 'Salvando...' : 'Salvar Receita'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de custos */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Custos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Custo Total:</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Custo Unitário:</span>
            <span>{formatCurrency(unitCost)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeDetails;