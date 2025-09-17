import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Info, DollarSign } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type OfficialPriceData = {
  officialPackagePrice: number;
  packageQuantity: number;
  unitPrice?: number;
  unit?: string;
};

type Props = {
  stockItem: any;
  addPriceData: OfficialPriceData;
  setAddPriceData: React.Dispatch<React.SetStateAction<OfficialPriceData>>;
  isPriceDialogOpen: boolean;
  setIsPriceDialogOpen: (o: boolean) => void;
  onAddPrice: () => void;
};

export function StockItemOfficialPriceManager({
  stockItem,
  addPriceData,
  setAddPriceData,
  isPriceDialogOpen,
  setIsPriceDialogOpen,
  onAddPrice,
}: Props) {
  const calculateUnitPrice = () => {
    if (addPriceData.packageQuantity && addPriceData.packageQuantity > 0) {
      return addPriceData.officialPackagePrice / addPriceData.packageQuantity;
    }
    return 0;
  };

  useEffect(() => {
    setAddPriceData((prev) => ({
      ...prev,
      unitPrice: calculateUnitPrice(),
      unit: stockItem?.unit || "un",
    }));
  }, [addPriceData.officialPackagePrice, addPriceData.packageQuantity]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preço para Precificação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exibir informações atuais do preço oficial */}
        <div className="grid grid-cols-2 gap-4">
        <div>
            <Label>
            Preço Atual do Lote
            <Tooltip>
                <TooltipTrigger asChild>
                <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                Este é o valor total que você pagou pelo último lote deste produto.
                </TooltipContent>
            </Tooltip>
            </Label>
            <Input
            type="text"
            value={stockItem?.officialPriceHistoryOfficialPackagePrice?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "N/A"}
            readOnly
            />
        </div>

        <div>
            <Label>
            Quantidade no Lote
            <Tooltip>
                <TooltipTrigger asChild>
                <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                Número de itens que estavam nesse lote quando foi comprado.
                </TooltipContent>
            </Tooltip>
            </Label>
            <Input
            type="text"
            value={stockItem?.officialPriceHistoryQuantity || "N/A"}
            readOnly
            />
        </div>

        <div>
            <Label>
            Preço Unitário
            <Tooltip>
                <TooltipTrigger asChild>
                <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                Este é o valor de cada unidade do produto, calculado dividindo o preço do lote pela quantidade.
                </TooltipContent>
            </Tooltip>
            </Label>
            <Input
            type="text"
            value={stockItem?.officialPriceHistoryUnitPrice?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "N/A"}
            readOnly
            />
        </div>

        <div>
            <Label>
            Unidade
            <Tooltip>
                <TooltipTrigger asChild>
                <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                Unidade de medida do produto, por exemplo: "un" para unidade, "kg" para quilo.
                </TooltipContent>
            </Tooltip>
            </Label>
            <Input
            type="text"
            value={stockItem?.officialPriceHistoryUnit || "N/A"}
            readOnly
            />
        </div>
        </div>


        {/* Botão para adicionar novo preço */}
        <div className="flex items-center justify-between mt-4">
          <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <DollarSign className="h-4 w-4 mr-1" /> Alterar Preço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Preço Oficial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>
                    Preço do Lote (R$)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        O valor total que você pagou por um lote de produtos.
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={addPriceData.officialPackagePrice}
                    onChange={(e) =>
                      setAddPriceData((prev) => ({ ...prev, officialPackagePrice: Number(e.target.value) }))
                    }
                  />
                </div>

                <div>
                  <Label>
                    Quantidade de Itens no Lote
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Quantos itens existem neste lote. O preço unitário será calculado automaticamente.
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={addPriceData.packageQuantity}
                    onChange={(e) =>
                      setAddPriceData((prev) => ({ ...prev, packageQuantity: Number(e.target.value) }))
                    }
                  />
                </div>

                <div>
                  <Label>
                    Preço Unitário de um Item (prévia)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Este é o valor aproximado que cada unidade do produto custa, calculado automaticamente.
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="text"
                    value={addPriceData.unitPrice?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || ""}
                    readOnly
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={onAddPrice}>Adicionar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
