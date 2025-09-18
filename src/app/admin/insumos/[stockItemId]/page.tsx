"use client";

import { useState, useEffect } from "react";
import { stockItemService, StockItemResponse } from "@/services/stockItemService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { StockItemHeader } from "@/components/admin/stock-item/StockItemHeader";
import { StockItemForm } from "@/components/admin/stock-item/StockItemForm";
import { StockItemStockManager } from "@/components/admin/stock-item/StockItemStockManager";
import { StockItemMovements } from "@/components/admin/stock-item/StockItemMovements";
import { BASE_URL } from "@/config/api";
import { StockItemOfficialPriceHistory } from "@/components/admin/stock-item/StockItemOfficialPriceHistory";
import { StockItemOfficialPriceManager } from "@/components/admin/stock-item/StockItemOfficialPriceManager";

const StockItemDetail = () => {
  const router = useRouter();
  const params = useParams();
  const stockItemId = params?.stockItemId;
  const isNew = stockItemId === "novo";

  const [stockItem, setStockItem] = useState<StockItemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Controle de modais
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [isRemoveStockDialogOpen, setIsRemoveStockDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [adjustStockData, setAdjustStockData] = useState({ lots: 1, quantity: 0 });
  const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  // Form principal
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    minimumQuantity: 0,
    maximumQuantity: 0,
    costType: "",
  });

  // Estados separados para estoque
  const [addStockData, setAddStockData] = useState({
    lots: 1,
    quantityPerLot: 1,
    totalCost: 0,
    movementReason: "",
  });

  const [removeStockData, setRemoveStockData] = useState({
    lots: 1,
    quantityPerLot: 1,
    totalCost: 0,
    movementReason: "",
  });

  // Estado para preço oficial
  const [newOfficialPriceData, setNewOfficialPriceData] = useState({
    officialPackagePrice: 0,
    packageQuantity: 0,
  });
  const [addingPrice, setAddingPrice] = useState(false);

  useEffect(() => {
    if (!isNew && stockItemId) loadStockItem();
    if (isNew) setIsEditing(true);
  }, [stockItemId]);

  const loadStockItem = async () => {
    if (!stockItemId) return;
    setLoading(true);
    try {
      const item = await stockItemService.getById(Number(stockItemId));
      if (item) {
        setStockItem(item);
        setFormData({
          name: item.name,
          unit: item.unit || "",
          minimumQuantity: item.minimumQuantity || 0,
          maximumQuantity: item.maximumQuantity || 0,
          costType: item.costType || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await stockItemService.create(formData);
        toast({ title: "Insumo criado com sucesso!" });
      } else {
        await stockItemService.update(Number(stockItemId), formData);
        toast({ title: "Insumo atualizado com sucesso!" });
      }
      router.push("/admin/insumos");
    } catch {
      toast({ title: "Erro ao salvar insumo", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddStock = async () => {
    if (!stockItem) return;
    try {
      const success = await stockItemService.addStock(stockItem.id, addStockData);
      if (success) {
        toast({ title: "Estoque atualizado!" });
        setAddStockData({ lots: 1, quantityPerLot: 1, totalCost: 0, movementReason: "" });
        await loadStockItem();
        setIsAddStockDialogOpen(false);
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao atualizar estoque", variant: "destructive" });
    }
  };

  const handleRemoveStock = async () => {
    if (!stockItem) return;
    try {
      const success = await stockItemService.removeStock(stockItem.id, removeStockData);
      if (success) {
        toast({ title: "Estoque atualizado!" });
        setRemoveStockData({ lots: 1, quantityPerLot: 1, totalCost: 0, movementReason: "" });
        await loadStockItem();
        setIsRemoveStockDialogOpen(false);
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao atualizar estoque", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!stockItem || !confirm("Deseja realmente excluir este insumo?")) return;
    try {
      const success = await stockItemService.delete(stockItem.id);
      if (success) {
        toast({ title: "Insumo excluído!" });
        router.push("/admin/insumos");
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao excluir insumo", variant: "destructive" });
    }
  };

  const handleAddOfficialPrice = async () => {
    if (!stockItem) return;
    setAddingPrice(true);
    try {
      const response = await fetch(`${BASE_URL}/api/StockItemOfficialPrices/${stockItem.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOfficialPriceData),
      });

      if (!response.ok) throw new Error("Erro ao adicionar preço oficial");

      toast({ title: "Preço oficial adicionado!" });
      setNewOfficialPriceData({ officialPackagePrice: 0, packageQuantity: 0 });
      await loadStockItem();
    } catch {
      toast({ title: "Erro", description: "Falha ao adicionar preço oficial", variant: "destructive" });
    } finally {
      setAddingPrice(false);
    }
  };

  async function handleAdjustStock() {
    if (!stockItem) return;
    try {
      const response = await fetch(`${BASE_URL}/api/StockItems/${stockItem.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustStockData),
      });

      if (response.ok) {
        toast({ title: "Estoque atualizado!" });
        setAdjustStockData({ lots: 1, quantity: 1 });
        await loadStockItem();
        setIsRemoveStockDialogOpen(false);
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao ajustar estoque", variant: "destructive" });
    } finally {
      setAddingPrice(false);
      setIsAdjustStockDialogOpen(false);
    }
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleString("pt-BR");
  const getMovementTypeColor = (q: string) =>
    q === "Entry" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";


  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!isNew && !stockItem) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Insumo não encontrado</h2>
        <button onClick={() => router.push("/admin/insumos")}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StockItemHeader
        isNew={isNew}
        isEditing={isEditing}
        saving={saving}
        onBack={() => router.push("/admin/insumos")}
        onSave={handleSubmit}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onDelete={handleDelete}
        stockItemName={stockItem?.name}
        stockItemId={stockItem?.id}
      />

      <StockItemForm
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        stockItem={stockItem}
      />

      {!isNew && stockItem && (
        <>
          <StockItemStockManager
            stockItem={stockItem}
            addStockData={addStockData}
            setAddStockData={setAddStockData}
            isAddStockDialogOpen={isAddStockDialogOpen}
            setIsAddStockDialogOpen={setIsAddStockDialogOpen}
            onAddStock={handleAddStock}
            removeStockData={removeStockData}
            setRemoveStockData={setRemoveStockData}
            isRemoveStockDialogOpen={isRemoveStockDialogOpen}
            setIsRemoveStockDialogOpen={setIsRemoveStockDialogOpen}
            onRemoveStock={handleRemoveStock}
            adjustStockData={adjustStockData}
            setAdjustStockData={setAdjustStockData}
            isAdjustStockDialogOpen={isAdjustStockDialogOpen}
            setIsAdjustStockDialogOpen={setIsAdjustStockDialogOpen}
            onAdjustStock={handleAdjustStock}
          />

          <StockItemOfficialPriceManager
            stockItem={stockItem}
            addPriceData={newOfficialPriceData}
            setAddPriceData={setNewOfficialPriceData}
            isPriceDialogOpen={isPriceDialogOpen}
            setIsPriceDialogOpen={setIsPriceDialogOpen}
            onAddPrice={handleAddOfficialPrice}
          />

          <StockItemMovements
            stockMovements={stockItem?.stockMovements}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getMovementTypeColorStyle={getMovementTypeColor}
          />

          <StockItemOfficialPriceHistory
            officialPriceHistory={stockItem?.officialPriceHistory}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </>
      )}
    </div>
  );
};

export default StockItemDetail;
