import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package } from "lucide-react";

type OfficialPriceHistory = {
  id: number;
  officialPackagePrice: number;
  quantity: number;
  unitPrice: number;
  unit: number;
  createdAt: string;
};

type Props = {
  officialPriceHistory?: OfficialPriceHistory[];
  formatCurrency: (v: number) => string;
  formatDate: (d: string) => string;
};

export function StockItemOfficialPriceHistory({ officialPriceHistory, formatCurrency, formatDate }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Preço para Precificação</CardTitle>
      </CardHeader>
      <CardContent>
        {!officialPriceHistory || officialPriceHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum preço oficial registrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Quantidade Embalagem</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Preço Unitário</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officialPriceHistory
                .map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>{price.id}</TableCell>
                    <TableCell>{formatCurrency(price.officialPackagePrice)}</TableCell>
                    <TableCell>{price.quantity}</TableCell>
                    <TableCell>{price.unit}</TableCell>
                    <TableCell>{formatCurrency(price.unitPrice)}</TableCell>
                    <TableCell>{formatDate(price.createdAt)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
