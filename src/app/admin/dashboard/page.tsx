"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, ChefHat, Archive } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Produtos',
      value: '24',
      icon: Package,
      description: 'Total de produtos cadastrados'
    },
    {
      title: 'Pedidos Hoje',
      value: '8',
      icon: ShoppingCart,
      description: 'Pedidos do dia atual'
    },
    {
      title: 'Receitas',
      value: '12',
      icon: ChefHat,
      description: 'Receitas cadastradas'
    },
    {
      title: 'Categorias',
      value: '5',
      icon: Archive,
      description: 'Categorias ativas'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema administrativo</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Use o menu de navegação acima para acessar as diferentes seções do sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;