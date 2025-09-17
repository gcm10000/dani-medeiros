"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, Phone, Clock } from "lucide-react";

const PaymentRefunded = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen py-8">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground font-dancing">
                Pagamento Estornado
              </h1>
              <p className="text-muted-foreground">
                Seu dinheiro será devolvido
              </p>
            </div>
          </div>

          {/* Conteúdo principal */}
          <Card className="shadow-card border-warning/20">
            <CardHeader className="text-center">
              <div className="text-8xl mb-4">💰</div>
              <CardTitle className="text-warning">
                Estorno Processado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                <p className="text-muted-foreground mb-4">
                  Seu pagamento foi estornado com sucesso. O valor será 
                  devolvido para a mesma forma de pagamento utilizada.
                </p>
                
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Prazo para estorno:</span>
                  </div>
                  <div className="text-left space-y-1 text-sm">
                    <p>• <strong>Cartão de débito:</strong> até 7 dias úteis</p>
                    <p>• <strong>Cartão de crédito:</strong> na próxima fatura</p>
                    <p>• <strong>PIX:</strong> até 1 dia útil</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push("/")}
                  className="w-full"
                  variant="hero"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
                
                <Button 
                  onClick={() => router.push("/cardapio")}
                  variant="outline"
                  className="w-full"
                >
                  Fazer Novo Pedido
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  <p>Dúvidas sobre o estorno?</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto"
                    onClick={() => router.push("/contato")} // exemplo de página de contato
                  >
                    <Phone className="mr-1 h-3 w-3" />
                    Entre em contato conosco
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentRefunded;
