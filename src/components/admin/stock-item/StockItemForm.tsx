import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { costTypeMap, getCostTypeMap } from "@/utils/stockMovements";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type Props = {
  isEditing: boolean;
  formData: any;
  stockItem?: any;
  setFormData: (f: any) => void;
};

export function StockItemForm({ isEditing, formData, setFormData, stockItem }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Insumo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>
            Nome
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Nome do produto ou insumo que você está cadastrando.
              </TooltipContent>
            </Tooltip>
          </Label>
          {isEditing ? (
            <Input
              value={formData.name}
              onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))}
            />
          ) : (
            <p className="font-medium">{stockItem?.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>
              Unidade
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  Unidade de medida do insumo, por exemplo "un" (unidade) ou "kg" (quilo).
                </TooltipContent>
              </Tooltip>
            </Label>
            {isEditing ? (
              <Input
                value={formData.unit}
                onChange={(e) => setFormData((p: any) => ({ ...p, unit: e.target.value }))}
              />
            ) : (
              <p>{stockItem?.unit}</p>
            )}
          </div>

          <div>
            <Label>
              Tipo de Insumo
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  Categoria do insumo, que ajuda a controlar custos e estoque.
                </TooltipContent>
              </Tooltip>
            </Label>
            {isEditing ? (
              <select
                value={formData.costType}
                onChange={(e) => setFormData((p: any) => ({ ...p, costType: e.target.value }))}
                className="border border-gray-300 rounded px-2 py-1 w-full"
              >
                <option value="" disabled>Selecione</option>
                {Object.entries(costTypeMap)
                  .filter(([key]) => isNaN(Number(key)))
                  .map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
              </select>
            ) : (
              <p>{getCostTypeMap(stockItem?.costType)}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>
              Quantidade Mínima
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  Quantidade mínima que deve estar disponível em estoque para não faltar produtos.
                </TooltipContent>
              </Tooltip>
            </Label>
            {isEditing ? (
              <Input
                type="number"
                min={0}
                value={formData.minimumQuantity}
                onChange={(e) => setFormData((p: any) => ({ ...p, minimumQuantity: +e.target.value }))}
              />
            ) : (
              <p>{stockItem?.minimumQuantity}</p>
            )}
          </div>

          <div>
            <Label>
              Quantidade Máxima
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 inline-block h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  Quantidade máxima que você quer manter em estoque para evitar excesso.
                </TooltipContent>
              </Tooltip>
            </Label>
            {isEditing ? (
              <Input
                type="number"
                min={0}
                value={formData.maximumQuantity}
                onChange={(e) => setFormData((p: any) => ({ ...p, maximumQuantity: +e.target.value }))}
              />
            ) : (
              <p>{stockItem?.maximumQuantity}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
