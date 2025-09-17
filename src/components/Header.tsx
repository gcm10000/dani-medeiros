"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const { getItemCount } = useCart();
  const [itemCount, setItemCount] = useState<number | null>(null);

  // Atualiza apenas no cliente
  useEffect(() => {
    setItemCount(getItemCount());
  }, [getItemCount]);

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Cardápio', path: '/cardapio' },
    { name: 'Sobre', path: '/sobre' },
    { name: 'Contato', path: '/contato' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/81a4b5fc-2edf-4df5-8652-db8b0309f302.png" 
            alt="Dani Medeiros - Bolos e Doces" 
            className="h-12 w-12 rounded-full"
          />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-primary font-dancing">Dani Medeiros</h1>
            <p className="text-sm text-muted-foreground">Bolos e Doces</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-sm font-medium transition-smooth hover:text-primary ${
                isActive(item.path) 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Link href="/carrinho">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {!!itemCount && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center pulse-glow">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`text-lg font-medium transition-smooth hover:text-primary ${
                      isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;