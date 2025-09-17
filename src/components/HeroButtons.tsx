'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HeroButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/cardapio">
        <Button size="lg" variant="hero" className="text-lg px-8 py-6">
          Ver Cardápio
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
      <Button
        size="lg"
        variant="hero-outline"
        className="text-lg px-8 py-6"
        onClick={() =>
          window.open(
            'https://wa.me/5521959051443?text=Olá! Gostaria de saber mais sobre os doces.',
            '_blank'
          )
        }
      >
        Fale Conosco
      </Button>
    </div>
  );
}
