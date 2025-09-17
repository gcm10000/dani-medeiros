import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/50 border-t border-border mt-20">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/81a4b5fc-2edf-4df5-8652-db8b0309f302.png" 
                alt="Dani Medeiros" 
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold text-primary font-dancing">Dani Medeiros</h3>
                <p className="text-sm text-muted-foreground">Bolos e Doces Artesanais</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-md">
              Criando momentos doces e especiais desde 2025. Cada bolo e doce é feito com carinho 
              e ingredientes selecionados para proporcionar a melhor experiência gastronômica.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cardapio" className="text-muted-foreground hover:text-primary transition-smooth">
                  Cardápio
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-muted-foreground hover:text-primary transition-smooth">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-muted-foreground hover:text-primary transition-smooth">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato e Redes Sociais */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Siga-nos</h4>
            <div className="flex space-x-2 mb-4">
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button 
                variant="whatsapp" 
                size="icon"
                onClick={() => window.open('https://wa.me/5521959051443?text=Olá! Gostaria de fazer um pedido.', '_blank')}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Entre em contato pelo WhatsApp para encomendas personalizadas!
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Dani Medeiros - Bolos e Doces. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground flex items-center mt-2 md:mt-0">
            Feito com <Heart className="h-4 w-4 text-primary mx-1" /> e muito carinho
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;