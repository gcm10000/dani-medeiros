"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ShoppingBag,
  Package,
  ShoppingCart,
  ChefHat,
  Archive,
  Ticket,
  Home,
  Bell,
  LayoutDashboard,
  Cake,
  Menu,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminSse } from "@/contexts/AdminSseContext";
import ConnectionStatusIndicator from "@/components/admin/ConnectionStatusIndicator";

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const { messages, status } = useAdminSse();
  const pathname = usePathname();
  const router = useRouter();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { href: "/admin/categorias", label: "Categorias", icon: Archive },
    { href: "/admin/produtos", label: "Cardápio", icon: Cake },
    { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
    { href: "/admin/vendas", label: "Vendas Presenciais", icon: Package },
    { href: "/admin/cupons", label: "Cupons", icon: Ticket },
    { href: "/admin/receitas", label: "Receitas", icon: ChefHat },
    { href: "/admin/insumos", label: "Insumos", icon: ShoppingBag }
  ];

  const [notifications, setNotifications] = useState<Notification[]>(
    Array.from({ length: 30 }).map((_, i) => ({
      id: i + 1,
      title: `Notificação ${i + 1}`,
      description: `Descrição detalhada da notificação ${i + 1} que pode ser longa e precisa truncar...`,
      time: `${i + 1} min atrás`,
      read: i % 3 === 0
    }))
  );

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const renderNavigation = () => (
    <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center px-3 py-2 rounded-md hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
      >
        <Home className="h-5 w-5" />
        {(!isCollapsed || isMobile) && (
          <>
            <span className="ml-2 flex-1">Loja</span>
            <ExternalLink className="h-4 w-4" />
          </>
        )}
      </a>

      {navItems.map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-md hover:bg-muted transition-smooth ${
              isActive ? "bg-muted text-primary font-semibold" : ""
            } ${isCollapsed && !isMobile ? "justify-center" : "space-x-2"}`}
            onClick={() => isMobile && setIsSheetOpen(false)}
          >
            <item.icon className="h-5 w-5" />
            {(!isCollapsed || isMobile) && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const renderNotificationPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative w-full justify-start">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadNotifications.length}
            </span>
          )}
          <span className="ml-2">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {/* Popover notifications aqui */}
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop */}
      {!isMobile && (
        <aside className={`${isCollapsed ? "w-16" : "w-64"} border-r bg-card flex flex-col transition-all duration-300`}>
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b px-4">
            {isCollapsed ? (
              <img src="/assets/logo.png" alt="Logo" className="h-10 w-10 rounded-full" />
            ) : (
              <div className="flex items-center space-x-2">
                <img src="/assets/logo.png" alt="Logo" className="h-10 w-10 rounded-full" />
                <div>
                  <h1 className="text-lg font-bold text-primary font-dancing">Dani Medeiros</h1>
                  <p className="text-xs text-muted-foreground">Bolos e Doces</p>
                </div>
              </div>
            )}
          </div>

          {/* Toggle */}
          <div className="p-2 border-b">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="w-full">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {renderNavigation()}

          {/* Notificações */}
          <div className="p-4 border-t">
            <div className="ml-5">
              <ConnectionStatusIndicator />
            </div>
            {!isCollapsed && renderNotificationPopover()}
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <img src="/assets/logo.png" alt="Logo" className="h-8 w-8 rounded-full" />
            <div>
              <h1 className="text-sm font-bold text-primary font-dancing">Dani Medeiros</h1>
              <p className="text-xs text-muted-foreground">Bolos e Doces</p>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 ${isMobile ? "pt-16" : ""} p-6`}>{children}</main>
    </div>
  );
};

export default AdminLayout;
