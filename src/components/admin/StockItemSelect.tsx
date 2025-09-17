import { useState, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { RecipeStockItemDto, stockItemService } from "@/services/stockItemService";
import { Check, ChevronsUpDown } from "lucide-react";

interface StockItemSelectProps {
  value: string;
  selectedName: string;
  selectedUnit: string | null;
  selectedUnitCost: number | null;
  onChange: (id: string, name: string, unit: string | null, unitCost: number | null, type: string) => void;
}

const StockItemSelect = ({
  value,
  selectedName: initialName,
  selectedUnit: initialUnit,
  selectedUnitCost: initialUnitCost,
  onChange,
}: StockItemSelectProps) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<RecipeStockItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<RecipeStockItemDto | null>(
    initialName
      ? {
          refId: value,
          name: initialName,
          unit: initialUnit || "",
          unitCost: initialUnitCost || 0,
          type: (value && value.startsWith("recipe-")) ? "Recipe" : "StockItem",
          costType: "Ingredient", // default
        }
      : null
  );

  const [open, setOpen] = useState(false);

  // Sincroniza selected com value externo
  useEffect(() => {
    if (value && options.length > 0) {
      const item = options.find((o) => o.refId === value);
      if (item) setSelected(item);
    }
  }, [value, options]);

  // Busca com debounce
  useEffect(() => {
    if (!query) {
      setOptions([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const result = await stockItemService.getRecipeStockItems(1, 10, query);
        setOptions(result.items || []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (item: RecipeStockItemDto) => {
    debugger;
    setSelected(item);
    onChange(item.refId, item.name, item.unit, item.unitCost, item.type);
    setOpen(false);
  };

  const getDisplayName = (item: RecipeStockItemDto | null) => {
    if (item) {
      const emoji = item.type === "StockItem" ? "🛍️" : "👨‍🍳";
      return `${emoji} ${item.name}` + (item.unit && item.type === "StockItem" ? ` (${item.unit})` : "");
    }
    // Se não há item selecionado, mas há nome inicial, exibe o nome inicial formatado
    if (initialName) {
      // Usa o tipo do valor inicial se disponível
      let emoji = "🛍️";
      if (value && value.startsWith("recipe-")) emoji = "👨‍🍳";
      return `${emoji} ${initialName}${initialUnit ? ` (${initialUnit})` : ""}`;
    }
    return "Selecione um item";
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="w-full flex justify-between items-center border rounded-md bg-white px-3 py-2 shadow-sm text-sm select-none">
          {selected
            ? getDisplayName(selected)
            : (initialName
                ? getDisplayName(null)
                : "Selecione um item")}
          <ChevronsUpDown className="ml-2 h-5 w-5 text-gray-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white shadow-lg p-1 text-sm">
          <input
            type="text"
            className="w-full border-b border-gray-200 px-2 py-1 mb-1 text-sm focus:outline-none"
            placeholder="Buscar item..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <div className="text-gray-500 px-2 py-1 text-sm">Carregando...</div>}
          {!loading && options.length === 0 && query !== "" && (
            <div className="text-gray-500 px-2 py-1 text-sm">Nenhum item encontrado</div>
          )}
          {!loading &&
            options.map((item) => (
              <DropdownMenu.Item
                key={item.refId}
                className="relative flex items-center justify-between cursor-pointer select-none px-2 py-1 rounded hover:bg-blue-500 hover:text-white text-sm"
                onSelect={() => handleSelect(item)}
              >
                <span>
                  {item.type === "StockItem" ? "🛍️" : "👨‍🍳"} {item.name} {item.unit && item.type === "StockItem" ? `(${item.unit})` : ""}
                </span>
                {selected?.refId === item.refId && <Check className="h-4 w-4 text-blue-600" />}
              </DropdownMenu.Item>
            ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default StockItemSelect;
