export const movementTypeMap: Record<string, string> = {
  Entry: "Entrada",
  Exit: "Saída"
};

export const movementReasonMap: Record<string, string> = {
  Exit_Sale: "Venda",
  Exit_Donation: "Doação",
  Exit_Damage: "Perda/Dano",
  Entry_Purchase: "Compra/Produção",
  Entry_SaleReturn: "Devolução de Venda",
  Adjustment: "Ajuste de Estoque"
};


export const costTypeMap: Record<string, string> = {  
  Ingredient: 'Ingrediente',
  Packaging: 'Embalagem',
  Operational: 'Operacional',
  Marketing: 'Marketing',
};


export const getMovementTypeLabel = (type: string) => movementTypeMap[type] || type;

export const getMovementReasonLabel = (reason: string) => movementReasonMap[reason] || reason;


export const getCostTypeMap = (reason: string) => costTypeMap[reason] || reason;
