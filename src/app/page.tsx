'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Star, Heart, Award } from 'lucide-react';
import heroBakery from '@/assets/hero-bakery.jpg';
import chocolateCake from '@/assets/chocolate-cake.jpg';
import cupcakes from '@/assets/cupcakes.jpg';
import brigadeiros from '@/assets/brigadeiros.jpg';
import { HeroButtons } from '@/components/HeroButtons';

const Home = () => {
  const features = [
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Receitas Artesanais",
      description: "Cada receita é desenvolvida com ingredientes selecionados e técnicas tradicionais."
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Feito com Carinho",
      description: "Todo produto é preparado com amor e atenção aos mínimos detalhes."
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Qualidade Premium",
      description: "Utilizamos apenas ingredientes de primeira qualidade para garantir o melhor sabor."
    }
  ];

  const highlights = [
    { image: '/assets/chocolate-cake.jpg', title: 'Bolos Especiais', description: '...' },
    { image: '/assets/cupcakes.jpg', title: 'Cupcakes Artesanais', description: '...' },
    { image: '/assets/brigadeiros.jpg', title: 'Doces Gourmet', description: '...' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/assets/hero-bakery.jpg)` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-dancing">
            Dani Medeiros
          </h1>
          <h2 className="text-2xl md:text-3xl mb-8 font-light">
            Bolos e Doces Artesanais
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Criando momentos doces e memoráveis com receitas artesanais 
            e ingredientes selecionados. Cada doce é feito com carinho especial para você.
          </p>
          <HeroButtons />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-soft">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-dancing">
              Por que escolher nossos doces?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Combinamos tradição, qualidade e inovação para criar experiências únicas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-card hover:shadow-elegant transition-smooth border-primary/10">
                <CardContent className="pt-8 pb-6">
                  <div className="flex justify-center mb-4 float-animation" style={{ animationDelay: `${index * 0.2}s` }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-dancing">
              Nossos Destaques
            </h2>
            <p className="text-xl text-muted-foreground">
              Conheça alguns dos nossos produtos mais especiais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {highlights.map((highlight, index) => (
              <Card key={index} className="group overflow-hidden shadow-card hover:shadow-elegant transition-smooth">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={highlight.image} 
                    alt={highlight.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {highlight.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {highlight.description}
                  </p>
                  <Link href="/cardapio">
                    <Button variant="elegant" className="w-full">
                      Ver Mais
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary text-white">
        <div className="container px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 font-dancing">
            Pronto para adoçar seu dia?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Faça seu pedido agora e desfrute dos melhores doces artesanais da região. 
            Entregamos com todo carinho na sua casa!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cardapio">
              <Button size="lg" variant="hero-outline" className="text-lg px-8 py-6">
                Ver Cardápio Completo
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="whatsapp"
              className="text-lg px-8 py-6"
              onClick={() => window.open('https://wa.me/5521959051443?text=Olá! Gostaria de fazer um pedido personalizado.', '_blank')}
            >
              Pedido Personalizado
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;