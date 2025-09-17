// StockItemStockManager.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { movementReasonMap } from "@/utils/stockMovements";

type Props = {
  stockItem: any;

  addStockData: any;
  setAddStockData: (f: any) => void;
  isAddStockDialogOpen: boolean;
  setIsAddStockDialogOpen: (o: boolean) => void;
  onAddStock: () => void;

  removeStockData: any;
  setRemoveStockData: (f: any) => void;
  isRemoveStockDialogOpen: boolean;
  setIsRemoveStockDialogOpen: (o: boolean) => void;
  onRemoveStock: () => void;
  
  adjustStockData: any;
  setAdjustStockData: (d: any) => void;
  isAdjustStockDialogOpen: boolean;
  setIsAdjustStockDialogOpen: (o: boolean) => void;
  onAdjustStock: () => void;
};

export function StockItemStockManager({
  stockItem,

  addStockData,
  setAddStockData,
  isAddStockDialogOpen,
  setIsAddStockDialogOpen,
  onAddStock,

  removeStockData,
  setRemoveStockData,
  isRemoveStockDialogOpen,
  setIsRemoveStockDialogOpen,
  onRemoveStock,

  adjustStockData,
  setAdjustStockData,
  isAdjustStockDialogOpen,
  setIsAdjustStockDialogOpen,
  onAdjustStock,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <p>Quantidade Atual: {stockItem?.currentQuantity}</p>

          {/* Adicionar ao Estoque */}
          <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-1" /> Adicionar ao Estoque
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar ao Estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lotes</Label>
                  <Input
                    type="number"
                    min={1}
                    value={addStockData.lots}
                    onChange={(e) =>
                      setAddStockData((p: any) => ({ ...p, lots: +e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Quantidade por Lote</Label>
                  <Input
                    type="number"
                    min={1}
                    value={addStockData.quantityPerLot}
                    onChange={(e) =>
                      setAddStockData((p: any) => ({ ...p, quantityPerLot: +e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Motivo</Label>
                  <Select
                    value={addStockData.movementReason}
                    onValueChange={(v) =>
                      setAddStockData((p: any) => ({ ...p, movementReason: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(movementReasonMap)
                        .filter(([k]) => k.startsWith("Entry"))
                        .map(([k, l]) => (
                          <SelectItem key={k} value={k}>
                            {l}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Pago por Lote (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={addStockData.totalCost}
                    onChange={(e) =>
                      setAddStockData((p: any) => ({ ...p, totalCost: +e.target.value }))
                    }
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddStockDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={onAddStock}>Adicionar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Retirar do Estoque */}
          <Dialog open={isRemoveStockDialogOpen} onOpenChange={setIsRemoveStockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-1" /> Retirar do Estoque
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Retirar do Estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lotes</Label>
                  <Input
                    type="number"
                    min={1}
                    value={removeStockData.lots}
                    onChange={(e) =>
                      setRemoveStockData((p: any) => ({ ...p, lots: +e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Quantidade por Lote</Label>
                  <Input
                    type="number"
                    min={1}
                    value={removeStockData.quantityPerLot}
                    onChange={(e) =>
                      setRemoveStockData((p: any) => ({
                        ...p,
                        quantityPerLot: +e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Motivo</Label>
                  <Select
                    value={removeStockData.movementReason}
                    onValueChange={(v) =>
                      setRemoveStockData((p: any) => ({ ...p, movementReason: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(movementReasonMap)
                        .filter(([k]) => k.startsWith("Exit"))
                        .map(([k, l]) => (
                          <SelectItem key={k} value={k}>
                            {l}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prévia de Retirada (R$)</Label>
                  <Input
                    type="number"
                    readOnly
                    value={removeStockData.totalCost}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRemoveStockDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={onRemoveStock}>Retirar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>


          <Dialog open={isAdjustStockDialogOpen} onOpenChange={setIsAdjustStockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-1" /> Ajustar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajustar estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lotes</Label>
                  <Input
                    type="number"
                    min={1}
                    value={adjustStockData?.lots}
                    onChange={(e) =>
                      setAdjustStockData((p: any) => ({ ...p, lots: +e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Quantidade por Lote</Label>
                  <Input
                    type="number"
                    min={1}
                    value={adjustStockData?.quantityPerLot}
                    onChange={(e) =>
                      setAdjustStockData((p: any) => ({
                        ...p,
                        quantityPerLot: +e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAdjustStockDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={onAdjustStock}>Confirmar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </CardContent>
    </Card>
  );
}
