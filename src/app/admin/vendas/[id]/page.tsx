import ProductSaleForm from "@/components/admin/ProductSaleForm";

interface EditarVendaPageProps {
  params: { id: string };
}

export default async function EditarVendaPage({ params }: EditarVendaPageProps) {
    const resolvedParams = await params;

  return <ProductSaleForm params={resolvedParams} />;
}
