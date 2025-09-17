import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Edit3, Trash } from "lucide-react";

type Props = {
  isNew: boolean;
  isEditing: boolean;
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  stockItemName?: string;
  stockItemId?: number;
};

export function StockItemHeader({
  isNew, isEditing, saving, onBack, onSave, onEdit, onCancel, onDelete,
  stockItemName, stockItemId
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isNew ? "Novo Insumo" : stockItemName}</h1>
          {!isNew && <p className="text-muted-foreground">ID: {stockItemId}</p>}
        </div>
      </div>

      <div className="flex space-x-2">
        {isNew ? (
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar"}
          </Button>
        ) : isEditing ? (
          <>
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={onSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onEdit}>
              <Edit3 className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              <Trash className="h-4 w-4 mr-2" /> Excluir
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
