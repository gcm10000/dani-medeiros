"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, RefreshCw } from "lucide-react";

const PaymentDeclined = () => {
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
              onClick={() => router.push("/checkout")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground font-dancing">
                Pagamento Recusado
              </h1>
              <p className="text-muted-foreground">
                Houve um problema com seu pagamento
              </p>
            </div>
          </div>

          {/* Conteúdo principal */}
          <Card className="shadow-card border-destructive/20">
            <CardHeader className="text-center">
              <div className="text-8xl mb-4">❌</div>
              <CardTitle className="text-destructive">
                Pagamento Não Aprovado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                <p className="text-muted-foreground mb-4">
                  Seu pagamento foi recusado pela operadora do cartão. 
                  Isso pode acontecer por diversos motivos:
                </p>
                <div className="text-left bg-muted rounded-lg p-4 space-y-2">
                  <p className="text-sm">• Dados do cartão incorretos</p>
                  <p className="text-sm">• Limite insuficiente</p>
                  <p className="text-sm">• Cartão bloqueado ou vencido</p>
                  <p className="text-sm">• Problemas de segurança</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push("/checkout")}
                  className="w-full"
                  variant="hero"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  onClick={() => router.push("/checkout")}
                  variant="outline"
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Usar Outro Cartão
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  <p>Precisa de ajuda?</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    onClick={() => router.push("/contato")} // ex: página de contato
                  >
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

export default PaymentDeclined;
