"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash, Camera, FileText } from 'lucide-react';
import { recipeService, RecipeDetailsDto, RecipeFormData } from '@/services/recipeService';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';


const Recipes = () => {
  const [recipes, setRecipes] = useState<RecipeDetailsDto[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeDetailsDto | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    yieldQuantity: 0,
    notes: '',
    items: []
  });
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  // PAGINAÇÃO
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadRecipes(page);
  }, [page]);

  const loadRecipes = async (pageNum: number = 1) => {
    try {
      setLoadingList(true);
      const result = await recipeService.getPaged(pageNum, pageSize);
      setRecipes(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(Math.max(1, Math.ceil(result.totalCount / pageSize)));
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRecipe) {
        const updateResult = await recipeService.update(editingRecipe.id, formData);
        if (!updateResult) throw new Error("Erro ao atualizar receita");
        toast({ title: 'Receita atualizada com sucesso!' });
      } else {
        await recipeService.create(formData);
        toast({ title: 'Receita criada com sucesso!' });
      }

      await loadRecipes();
      handleCloseDialog();
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: `Erro ao salvar receita: ${error}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recipe: RecipeDetailsDto) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      yieldQuantity: recipe.yieldQuantity || 0,
      notes: recipe.notes || '',
      items: recipe.items.map(i => ({
        refId: i.stockItemId ? `stock-${i.stockItemId}` : '',
        refName: i.stockItemName || '',
        unit: i.unit || '',
        quantity: i.quantity,
        costType: i.costType,
        proportionalCost: i.proportionalCost,
        unitCost: i.unitCost
      }))
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      const success = await recipeService.delete(id);
      if (success) {
        toast({ title: 'Receita excluída com sucesso!' });
        await loadRecipes();
      } else {
        toast({ 
          title: 'Erro', 
          description: 'Erro ao excluir receita',
          variant: 'destructive'
        });
      }
    }
  };

  const handleSaveSnapshot = async (recipeId: number) => {
    const success = await recipeService.saveSnapshot(recipeId);
    if (success) {
      toast({ title: 'Snapshot de precificação salvo com sucesso!' });
    } else {
      toast({ 
        title: 'Erro', 
        description: 'Erro ao salvar snapshot',
        variant: 'destructive'
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRecipe(null);
    setFormData({ name: '', yieldQuantity: 0, notes: '', items: [] });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Receitas</h1>
          <p className="text-muted-foreground">Gerencie as receitas e precificação</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRecipe(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRecipe ? 'Editar Receita' : 'Nova Receita'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="yieldQuantity">Rendimento</Label>
                <Input
                  id="yieldQuantity"
                  type="number"
                  value={formData.yieldQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, yieldQuantity: parseInt(e.target.value) }))}
                />
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de receitas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Rendimento</TableHead>
                <TableHead>Custo Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingList ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                recipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>{recipe.id}</TableCell>
                    <TableCell className="font-medium">{recipe.name}</TableCell>
                    <TableCell>{recipe.yieldQuantity || 'N/A'}</TableCell>
                    <TableCell>{formatCurrency(recipe.totalCost)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/receitas/${recipe.id}`)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSaveSnapshot(recipe.id)}>
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(recipe)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(recipe.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span>
              Página {page} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              Próxima
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            ({totalCount} receitas no total)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recipes;
