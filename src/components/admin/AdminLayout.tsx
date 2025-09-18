import { Outlet, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
} from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminSse } from '@/contexts/AdminSseContext';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const AdminLayout = () => {
  const isMobile = useIsMobile();
    const { messages, status } = useAdminSse();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/categorias', label: 'Categorias', icon: Archive },
    { to: '/admin/produtos', label: 'Cardápio', icon: Cake },
    { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
    { to: '/admin/vendas', label: 'Vendas Presenciais', icon: Package },
    { to: '/admin/cupons', label: 'Cupons', icon: Ticket },
    { to: '/admin/receitas', label: 'Receitas', icon: ChefHat },
    { to: '/admin/insumos', label: 'Insumos', icon: ShoppingBag },
  ];

  const [notifications, setNotifications] = useState<Notification[]>(
    Array.from({ length: 30 }).map((_, i) => ({
      id: i + 1,
      title: `Notificação ${i + 1}`,
      description: `Descrição detalhada da notificação ${i + 1} que pode ser longa e precisa truncar...`,
      time: `${i + 1} min atrás`,
      read: i % 3 === 0,
    }))
  );

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const renderNotification = (note: Notification, isRead: boolean) => (
    <div
      key={note.id}
      className="text-sm border-b pb-1 px-2 flex flex-col"
    >
      <div className="flex items-center space-x-2">
        {!isRead && (
          <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0"></span>
        )}
        <div className={`truncate ${!isRead ? 'font-medium' : 'text-muted-foreground'}`}>
          {note.title}
        </div>
      </div>
      <div className="text-xs truncate text-muted-foreground">{note.description}</div>
      <div className="text-xs text-muted-foreground">{note.time}</div>
    </div>
  );

  const renderNavigation = () => (
    <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
      {/* Link para Loja */}
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
      
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => isMobile && setIsSheetOpen(false)}
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-md hover:bg-muted transition-smooth ${
              isActive ? 'bg-muted text-primary font-semibold' : ''
            } ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-2'}`
          }
        >
          <item.icon className="h-5 w-5" />
          {(!isCollapsed || isMobile) && <span>{item.label}</span>}
        </NavLink>
      ))}
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
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-sm">Notificações</div>
          {unreadNotifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-2 h-6"
              onClick={markAllAsRead}
            >
              Marcar todas
            </Button>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {unreadNotifications.length > 0 && (
            <>
              <div className="text-sm font-medium">Não Lidas</div>
              {unreadNotifications.map((note) => renderNotification(note, false))}
            </>
          )}

          {readNotifications.length > 0 && (
            <>
              <div className="text-sm font-medium mt-2">Lidas</div>
              {readNotifications.map((note) => renderNotification(note, true))}
            </>
          )}

          {notifications.length === 0 && (
            <div className="text-sm text-muted-foreground">Nenhuma notificação</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={`${isCollapsed ? 'w-16' : 'w-64'} border-r bg-card flex flex-col transition-all duration-300`}>
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b px-4">
            {isCollapsed ? (
              <img 
                src="/assets/logo.png" 
                alt="Dani Medeiros - Bolos e Doces" 
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <img 
                  src="/assets/logo.png" 
                  alt="Dani Medeiros - Bolos e Doces" 
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <h1 className="text-lg font-bold text-primary font-dancing">Dani Medeiros</h1>
                  <p className="text-xs text-muted-foreground">Bolos e Doces</p>
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <div className="p-2 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {renderNavigation()}

          {/* Notificações */}
          <div className="p-4 border-t">
            <div className="ml-5">
              <ConnectionStatusIndicator />
            </div>
            {!isCollapsed && renderNotificationPopover()}
            {isCollapsed && (
              <Button variant="ghost" size="icon" className="w-full">
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>
            )}
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <img 
              src="/assets/logo.png" 
              alt="Dani Medeiros - Bolos e Doces" 
              className="h-8 w-8 rounded-full"
            />
            <div>
              <h1 className="text-sm font-bold text-primary font-dancing">Dani Medeiros</h1>
              <p className="text-xs text-muted-foreground">Bolos e Doces</p>
            </div>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col h-full">
                {renderNavigation()}
                <div className="p-4 border-t">
                  <div className="ml-5">
                    <ConnectionStatusIndicator />
                  </div>
                  {renderNotificationPopover()}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${isMobile ? 'pt-16' : ''} p-6`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
