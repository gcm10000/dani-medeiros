"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Trash, Plus, Image as ImageIcon, Star, Package, Edit3, Pause, Play } from 'lucide-react';
import { productService, AdminProduct, ProductImage } from '@/services/productService';
import { categoryService, Category } from '@/services/categoryService';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog as ConfirmDialog, DialogTrigger as ConfirmDialogTrigger, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle } from '@/components/ui/dialog';
import ImageCarousel from '@/components/ImageCarousel';

const ProductDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.productId as string;
  console.log('ProductDetails id:', id);

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageToRemove, setImageToRemove] = useState<ProductImage | null>(null);
  const [isRemoveImageDialogOpen, setIsRemoveImageDialogOpen] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
  });
  
  const [stockData, setStockData] = useState({ 
    quantity: 0, 
    type: 'add' as 'add' | 'adjust' 
  });
  
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [productData, categoriesData] = await Promise.all([
        productService.getByIdAdmin(parseInt(id)),
        categoryService.getAll()
      ]);
      
      if (productData) {
        setProduct(productData);
        setFormData({
          name: productData.name,
          description: productData.description || '',
          price: productData.price,
          categoryId: productData.categoryId
        });
        setImages(productData.images);
      }
      
      setCategories(categoriesData);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!product || !id) return;
    
    setSaving(true);
    try {
      const updated = await productService.update(parseInt(id), {
        ...product,
        ...formData
      });
      if (updated) {
        setProduct(updated);
        setIsEditing(false);
        toast({ title: 'Produto atualizado com sucesso!' });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar produto',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStockSubmit = async () => {
    if (!product) return;
    
    try {
      let success = false;
      if (stockData.type === 'add') {
        success = await productService.addStock(product.id, stockData.quantity);
      } else {
        success = await productService.adjustStock(product.id, stockData.quantity);
      }

      if (success) {
        toast({ title: 'Estoque atualizado com sucesso!' });
        await loadData();
        setIsStockDialogOpen(false);
        setStockData({ quantity: 0, type: 'add' });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar estoque',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    const newImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Upload para o servidor
      const uploadedUrl = await productService.uploadImage(id, file);
      if (uploadedUrl) newImages.push(uploadedUrl);
    }

    setImages(prev => [...prev, 
      ...newImages.map(newImage => ({ 
        id: newImage.id, 
        url: newImage.url, 
        isMain: false }
      )
    )]);

    toast({ 
      title: 'Imagens adicionadas!', 
      description: `${newImages.length} imagem(ns) enviada(s) com sucesso.` 
    });
    setUploadingImages(false);
  };

  const handleSetMainImage = async (imageId: number) => {
    try {
      const response = await productService.setMainImage(product!.id, imageId);
      setImages(response);
      setCurrentImageIndex(0);
      toast({ 
        title: 'Imagem principal atualizada!', 
        description: 'A imagem principal foi alterada com sucesso.'
      });

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao definir imagem principal',
        variant: 'destructive'
      });
    }
  }

  const handleRemoveImage = (imageId: number) => {
    const img = images.find(img => img.id === imageId);
    setImageToRemove(img!);
    setIsRemoveImageDialogOpen(true);
  };

  const confirmRemoveImage = async () => {
    if (!id || !imageToRemove) return;
    setRemovingImage(true);
    const success = await productService.deleteImage(id, imageToRemove.id);
    if (success) {
      setImages(prev => {
        const newImages = prev.filter(img => img.id !== imageToRemove.id);
        // Ajusta o índice da imagem atual após remoção
        if (newImages.length === 0) {
          setCurrentImageIndex(0);
        } else if (currentImageIndex >= newImages.length) {
          setCurrentImageIndex(Math.max(0, newImages.length - 1));
        }
        return newImages;
      });
      toast({ title: 'Imagem removida com sucesso!' });
    } else {
      toast({ title: 'Erro ao remover imagem', variant: 'destructive' });
    }
    setIsRemoveImageDialogOpen(false);
    setImageToRemove(null);
    setRemovingImage(false);
  };

  const handleDelete = async () => {
    if (!product || !confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      const success = await productService.delete(product.id);
      if (success) {
        toast({ title: 'Produto excluído com sucesso!' });
        router.push('/admin/produtos');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir produto',
        variant: 'destructive'
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

  const getMovementTypeColorStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'exit': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const movementTypeMap: Record<string, string> = {
  Entry: "Entrada",
  Exit: "Saída"
};

const movementReasonMap: Record<string, string> = {
  Exit_Sale: "Venda",
  Exit_Donation: "Doação",
  Exit_Damage: "Perda/Dano",
  Entry_Purchase: "Compra/Produção",
  Entry_SaleReturn: "Devolução de Venda",
  Adjustment: "Ajuste de Estoque"
};

const getMovementTypeLabel = (type: string) => movementTypeMap[type] || type;
const getMovementReasonLabel = (reason: string) => movementReasonMap[reason] || reason;



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
        <Button onClick={() => router.push('/admin/produtos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/admin/produtos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              {isEditing ? 'Editando Produto' : product.name}
              {typeof product.isActive !== 'undefined' && (
                <Badge className={product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {product.isActive ? 'Ativo' : 'Pausado'}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">ID: {product.id}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  const updated = await productService.setActiveStatus(product.id, !product.isActive);
                  if (updated) {
                    setProduct(updated);
                    toast({ title: product.isActive ? "Produto pausado!" : "Produto retomado!" });
                  } else {
                    toast({ title: "Erro ao atualizar status", variant: "destructive" });
                  }
                }}
              >
                {product.isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {product.isActive ? "Pausar" : "Retomar"}
              </Button>
              <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <ConfirmDialogTrigger asChild>
                  <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </ConfirmDialogTrigger>
                <ConfirmDialogContent>
                  <ConfirmDialogHeader>
                    <ConfirmDialogTitle>Confirmar exclusão</ConfirmDialogTitle>
                  </ConfirmDialogHeader>
                  <p>Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={async () => { await handleDelete(); setIsDeleteDialogOpen(false); }}>
                      Confirmar Exclusão
                    </Button>
                  </div>
                </ConfirmDialogContent>
              </ConfirmDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Imagens */}
        <Card>
          <CardHeader>
            <CardTitle>Imagens do Produto</CardTitle>
          </CardHeader>
            <CardContent>
            <div className="relative">
              <ImageCarousel
                images={images}
                onSetMainImage={handleSetMainImage}
                onImagesChange={setImages}
                onUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                isEditing={isEditing}
                currentIndex={currentImageIndex}
                setCurrentIndex={setCurrentImageIndex}
              />
              {(uploadingImages || removingImage) && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span className="text-white">{uploadingImages ? 'Enviando imagens...' : 'Removendo imagem...'}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Modal de confirmação de remoção de imagem */}
            <ConfirmDialog open={isRemoveImageDialogOpen} onOpenChange={setIsRemoveImageDialogOpen}>
              <ConfirmDialogTrigger asChild>
                {/* hidden trigger, modal control is manual */}
                <span style={{ display: 'none' }} />
              </ConfirmDialogTrigger>
              <ConfirmDialogContent>
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>Remover imagem</ConfirmDialogTitle>
                </ConfirmDialogHeader>
                <p>Tem certeza que deseja remover esta imagem? Esta ação não pode ser desfeita.</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => { setIsRemoveImageDialogOpen(false); setImageToRemove(null); }}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={confirmRemoveImage}>
                    Confirmar Remoção
                  </Button>
                </div>
              </ConfirmDialogContent>
            </ConfirmDialog>
            </CardContent>
        </Card>
        {/* Informações do Produto */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <p className="text-foreground font-medium">{product.name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              ) : (
                <p className="text-muted-foreground">{product.description || 'Sem descrição'}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço</Label>
                {isEditing ? (
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  />
                ) : (
                  <p className="text-foreground font-medium">{formatCurrency(product.price)}</p>
                )}
              </div>
              
              <div>
                <Label>Estoque</Label>
                <div className="flex items-center space-x-2">
                  <p className="text-foreground font-medium">{product.stock || 0} unidades</p>
                  <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Package className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Gerenciar Estoque</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Tipo de Operação</Label>
                          <Select
                            value={stockData.type}
                            onValueChange={(value: 'add' | 'adjust') => setStockData(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add">Adicionar Quantidade</SelectItem>
                              <SelectItem value="adjust">Ajustar Estoque Total</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="quantity">
                            {stockData.type === 'add' ? 'Quantidade a Adicionar' : 'Nova Quantidade Total'}
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={stockData.quantity}
                            onChange={(e) => setStockData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleStockSubmit}>
                            Atualizar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">Categoria</Label>
              {isEditing ? (
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: parseInt(value) }))}
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
              ) : (
                <p className="text-foreground font-medium">{product.categoryName}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações de Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {!product.stockMovements || product.stockMovements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma movimentação registrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Quantidade Atual</TableHead>
                  <TableHead>Quantidade Movimentada</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.stockMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {movement.stockItemName || movement.productName}
                    </TableCell>
                    <TableCell>
                      <Badge className={getMovementTypeColorStyle(movement.type)}>
                        {getMovementTypeLabel(movement.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getMovementReasonLabel(movement.reason)}</TableCell>
                    <TableCell>{movement.currentQuantity}</TableCell>
                    <TableCell>{movement.movementQuantity}</TableCell>
                    <TableCell>{formatDate(movement.createdAt)}</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetails;
