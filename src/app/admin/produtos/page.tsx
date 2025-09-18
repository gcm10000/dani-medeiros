"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash, Package } from "lucide-react";
import { productService, AdminProduct } from "@/services/productService";
import { categoryService, Category } from "@/services/categoryService";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Products = () => {
  const router = useRouter();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
  });
  const [stockData, setStockData] = useState({ quantity: 0, type: "add" });
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoadingList(true);
    try {
      const data = await productService.getAllAdmin();
      setProducts(data);
    } finally {
      setLoadingList(false);
    }
  };

  const loadCategories = async () => {
    const data = await categoryService.getAll();
    setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, {
          ...formData,
          stock: editingProduct.stock,
          categoryName: editingProduct.categoryName,
          stockMovements: editingProduct.stockMovements,
          isActive: editingProduct.isActive,
          images: editingProduct.images || [],
        });
        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        await productService.create({
          ...formData,
          stock: 0,
          categoryName: categories.find((cat) => cat.id === formData.categoryId)?.name || "",
          stockMovements: [],
          isActive: true,
          images: [],
        });
        toast({ title: "Produto criado com sucesso!" });
      }
      await loadProducts();
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    try {
      let success = false;
      if (stockData.type === "add") {
        success = await productService.addStock(selectedProduct.id, stockData.quantity);
      } else {
        success = await productService.adjustStock(selectedProduct.id, stockData.quantity);
      }

      if (success) {
        toast({ title: "Estoque atualizado com sucesso!" });
        await loadProducts();
        setIsStockDialogOpen(false);
        setStockData({ quantity: 0, type: "add" });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar estoque",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar estoque",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      categoryId: product.categoryId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      const success = await productService.delete(id);
      if (success) {
        toast({ title: "Produto excluído com sucesso!" });
        await loadProducts();
      } else {
        toast({
          title: "Erro",
          description: "Erro ao excluir produto",
          variant: "destructive",
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: 0, categoryId: 0 });
  };

  const handleStockManagement = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsStockDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cardápio</h1>
          <p className="text-muted-foreground">Gerencie o cardápio</p>
        </div>

        {/* Dialog de Produto */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                )}
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                {loading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="price">Preço</Label>
                {loading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                    required
                  />
                )}
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                {loading ? (
                  <Skeleton className="h-10 w-48" />
                ) : (
                  <Select
                    value={formData.categoryId.toString()}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Estoque */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Estoque - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStockSubmit} className="space-y-4">
            <div>
              <Label>Tipo de Operação</Label>
              <Select value={stockData.type} onValueChange={(value) => setStockData((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Adicionar Quantidade (Entrada)</SelectItem>
                  <SelectItem value="adjust">Ajustar Estoque Manualmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">
                {stockData.type === "add" ? "Quantidade a Adicionar" : "Nova Quantidade Total"}
              </Label>
              <Input
                id="quantity"
                type="number"
                value={stockData.quantity}
                onChange={(e) => setStockData((prev) => ({ ...prev, quantity: parseInt(e.target.value) }))}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Atualizando..." : "Atualizar Estoque"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos à Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingList
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                : products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.stock || 0}</TableCell>
                      <TableCell>
                        <span
                          className={
                            product.isActive
                              ? "bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                              : "bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
                          }
                        >
                          {product.isActive ? "Ativo" : "Pausado"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleStockManagement(product)}>
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/produtos/${product.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
