import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { getMovementTypeLabel } from "@/utils/stockMovements";

type Props = {
  stockMovements?: any[];
  formatCurrency: (v: number) => string;
  formatDate: (d: string) => string;
  getMovementTypeColorStyle: (q: string) => string;
};

export function StockItemMovements({ stockMovements, formatCurrency, formatDate, getMovementTypeColorStyle }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        {!stockMovements || stockMovements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma movimentação registrada</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Lotes</TableHead>
                <TableHead>Qtd/Lote</TableHead>
                <TableHead>Total por Lote</TableHead>
                <TableHead>Movimentação</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements.map((mv) => (
                <TableRow key={mv.id}>
                  <TableCell>{mv.id}</TableCell>
                  <TableCell>{mv.lots}</TableCell>
                  <TableCell>{mv.quantityPerLot}</TableCell>
                  <TableCell>{formatCurrency(mv.totalCost)}</TableCell>
                  <TableCell>
                    <Badge className={getMovementTypeColorStyle(mv.type)}>
                      {getMovementTypeLabel(mv.type)}
                      {/* {mv.movementQuantity > 0 ? "Entrada" : "Saída"} */}
                    </Badge>
                  </TableCell>
                  <TableCell>{mv.currentQuantity}</TableCell>
                  <TableCell>{formatDate(mv.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
