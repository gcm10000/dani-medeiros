"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { couponService } from '@/services/couponService';
import { paymentService } from '@/services/paymentService';
import { generateIdempotencyKey } from '@/utils/idempotencyKey';
import Link from 'next/link';

// Adicione as bandeiras suportadas
const CARD_BRANDS: Record<string, { name: string; icon: string }> = {
  visa: { name: 'Visa', icon: 'https://img.icons8.com/color/32/000000/visa.png' },
  mastercard: { name: 'Mastercard', icon: 'https://img.icons8.com/color/32/000000/mastercard-logo.png' },
  amex: { name: 'Amex', icon: 'https://img.icons8.com/color/32/000000/amex.png' },
  elo: { name: 'Elo', icon: 'https://img.icons8.com/color/32/000000/elo-card.png' },
  hipercard: { name: 'Hipercard', icon: 'https://img.icons8.com/color/32/000000/hipercard.png' },
  // ...adicione outras se necessário
};

const Checkout = () => {
  const { items, getTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '', // bairro
    city: '',
    zipCode: '',
    paymentMethod: 'pix',
    observations: '',
    coupon: ''
  });
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponValue, setCouponValue] = useState(0);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    cardholderName: '',
    identificationNumber: '',
    // Novos campos para aumentar confiabilidade
    cardholderPhone: '',
    cardholderEmail: '',
    billingAddress: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  });
  const [cardBrand, setCardBrand] = useState('');
  const [cardBrandIcon, setCardBrandIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [mpLoaded, setMpLoaded] = useState(false);

  const deliveryFee = 8.00;
  const total = getTotal();
  const finalTotal = total + deliveryFee - couponValue;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Aplica máscara (11) 99999-9999
      let v = value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      if (v.length > 9) v = `${v.slice(0,10)}-${v.slice(10)}`;
      setFormData(prev => ({ ...prev, [name]: v }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Função para aplicar cupom
  async function handleApplyCoupon() {
    setCouponError('');
    if (!formData.coupon) {
      setCouponError('Digite um cupom.');
      return;
    }
    const coupon = await couponService.getByCode(formData.coupon);
    if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date())) {
      setCouponApplied(true);
      setCouponError('');
      setCouponValue(coupon.value || 0);
      toast({ title: 'Cupom aplicado!', description: `Cupom ${formData.coupon} válido.` });
    } else {
      setCouponApplied(false);
      setCouponValue(0);
      setCouponError('Cupom inválido ou expirado.');
      toast({ title: 'Cupom inválido', description: 'Verifique o código e tente novamente.', variant: 'destructive' });
    }
  }

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('billingAddress.')) {
      const field = name.split('.')[1];
      setCardData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    } else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateRequiredFields = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push('Nome completo é obrigatório');
    if (!formData.phone.trim()) errors.push('WhatsApp é obrigatório');
    if (!formData.address.trim()) errors.push('Endereço é obrigatório');
    if (!formData.number.trim()) errors.push('Número é obrigatório');
    if (!formData.city.trim()) errors.push('Cidade é obrigatória');
    if (!formData.neighborhood.trim()) errors.push('Bairro é obrigatório');
    if (!formData.zipCode.trim()) errors.push('CEP é obrigatório');
    
    if (formData.paymentMethod === 'card') {
      if (!cardData.cardNumber.replace(/\s/g, '')) errors.push('Número do cartão é obrigatório');
      if (!cardData.expiryDate) errors.push('Validade do cartão é obrigatória');
      if (!cardData.securityCode) errors.push('CVV é obrigatório');
      if (!cardData.cardholderName.trim()) errors.push('Nome do titular é obrigatório');
      if (!cardData.identificationNumber.replace(/\D/g, '')) errors.push('CPF do titular é obrigatório');
      if (!cardData.cardholderPhone.replace(/\D/g, '')) errors.push('Telefone do titular é obrigatório');
      if (!cardData.cardholderEmail.trim()) errors.push('E-mail do comprador é obrigatório');
    }
    
    return errors;
  };

  const handlePixPayment = async () => {
    const validationErrors = validateRequiredFields();
    if (validationErrors.length > 0) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: validationErrors[0],
        variant: "destructive"
      });
      return;
    }

    // Prepare os dados do pedido
    const idempotencyKey = generateIdempotencyKey();
    const orderData = {
      items,
      total,
      deliveryFee,
      finalTotal,
      customerData: formData,
      idempotencyKey
    };

    try {
      setIsProcessing(true);
      const orderId = await paymentService.generatePixPayment(orderData, idempotencyKey);
      toast({
        title: "PIX gerado!",
        description: "Use o QR Code ou código PIX para realizar o pagamento.",
      });
          
      // Redirecione para a rota pix-payment passando o orderId
      if (orderId) {
          setOrderComplete(true);
          clearCart();
          window.location.href = `/pix-payment/${orderId}`;
      }
    }
    catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro ao gerar o PIX. Tente novamente.",
        variant: "destructive"
      });
    }
    finally {
      setIsProcessing(false);
    }

  };

const handleCardPayment = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setIsLoadingCard(true);

  try {
    // Validação completa usando a função de validação
    const validationErrors = validateRequiredFields();
    if (validationErrors.length > 0) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: validationErrors[0],
        variant: "destructive"
      });
      setIsLoadingCard(false);
      return;
    }

    // Separar mês/ano
    const [expMonth, expYear] = cardData.expiryDate.split('/');
    if (!expMonth || !expYear) {
      toast({
        title: "Data de validade inválida.",
        variant: "destructive",
      });
      setIsLoadingCard(false);
      return;
    }

    // Verifica se o SDK está carregado
    if (!(window as any).MercadoPago) {
      toast({
        title: "Erro ao carregar Mercado Pago.",
        variant: "destructive",
      });
      setIsLoadingCard(false);
      return;
    }

    // Cria instância do SDK v2
    const mp = new (window as any).MercadoPago(PUBLIC_KEY, { locale: 'pt-BR' });
    debugger;
    
    // Criação do token de cartão
    const cardToken = await mp.createCardToken({
      cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      cardExpirationMonth: expMonth,
      cardExpirationYear: expYear.length === 2 ? `20${expYear}` : expYear,
      securityCode: cardData.securityCode,
      cardholderName: cardData.cardholderName,
      identificationType: 'CPF',
      identificationNumber: cardData.identificationNumber.replace(/\D/g, '')
    });

    console.log('CardToken:', cardToken.id);
    console.log('Card Brand:', cardBrand);

    toast({
      title: "Pagamento processado!",
      description: `Token gerado: ${cardToken.id}`,
    });

    // Aqui você envia o token para sua API
    // await fetch('/api/pagamento', { method: 'POST', body: JSON.stringify({ token: cardToken.id, ... }) });

    const idempotencyKey = generateIdempotencyKey();
    const paymentPayload = {
      token: cardToken.id,
      payment_method_id: cardBrand,
      transaction_amount: finalTotal,
      description: `Pedido - ${items.map(item => `${item.quantity}x ${item.product.name}`).join(', ')}`,
      payer: {
        email: cardData.cardholderEmail,
        phone: {
          area_code: cardData.cardholderPhone.slice(0, 2),
          number: cardData.cardholderPhone.slice(2)
        },
        identification: {
          type: 'CPF',
          number: cardData.identificationNumber.replace(/\D/g, "")
        },
        name: cardData.cardholderName,
        address: {
          zip_code: cardData.billingAddress.zipCode.replace(/\D/g, ""),
          street_name: cardData.billingAddress.street,
          street_number: cardData.billingAddress.number,
          neighborhood: cardData.billingAddress.neighborhood || '',
          city: cardData.billingAddress.city,
          federal_unit: cardData.billingAddress.state
        }
      },
      orderData: {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customerData: formData,
        coupon: couponApplied ? formData.coupon : ''
      }
    };

  const { paymentService } = await import('@/services/paymentService');
  await paymentService.processCardPayment(paymentPayload, idempotencyKey);

    clearCart();
    
    // Redirecionar para tela de acompanhamento
    const orderData = {
      id: Date.now().toString(),
      total: finalTotal,
      paymentMethod: "Cartão de Crédito",
      status: "pending" as const,
      estimatedTime: "30-45 min",
      items: items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }))
    };
    
    toast({
      title: "Pagamento processado!",
      description: "Redirecionando para acompanhamento do pedido...",
    });

    // navigate(`/acompanhar-pedido`, { state: { orderData } });

    window.location.href = `/acompanhar-pedido`;
  } catch (error: any) {
    toast({
      title: "Erro no pagamento",
      description: error?.message || "Ocorreu um erro ao processar o pagamento.",
      variant: "destructive",
    });
  } finally {
    setIsLoadingCard(false);
  }
};

const PUBLIC_KEY = "APP_USR-3e273da5-e31c-4626-ad9a-8cd0e466b19a";
// Função para buscar a bandeira via API do Mercado Pago usando o BIN
const fetchCardBrand = async (bin: string) => {
  try {
    // Aguarda até o MercadoPago estar disponível
    if (!(window as any).MercadoPago) {
      setCardBrand('');
      setCardBrandIcon(null);
      return;
    }

    // Busca métodos de pagamento pelo BIN
    const response = await mp.getPaymentMethods({ bin });
    
    if (response && response.results && response.results.length > 0) {
      const method = response.results[0];

      console.log('Bandeira detectada via API:', method.id);
      setCardBrand(method.id);
      
      if (method.thumbnail) {
        setCardBrandIcon(method.thumbnail);
      } else if (CARD_BRANDS[method.id]) {
        setCardBrandIcon(CARD_BRANDS[method.id].icon);
      } else {
        setCardBrandIcon(null);
      }
    } else {
      setCardBrand('');
      setCardBrandIcon(null);
    }
  } catch (error) {
    console.error('Erro ao buscar bandeira:', error);
    setCardBrand('');
    setCardBrandIcon(null);
  }
};

  // Detecta a bandeira do cartão ao digitar os 6 primeiros dígitos
  useEffect(() => {
    const bin = cardData.cardNumber.replace(/\D/g, '').slice(0, 6);
    console.log('BIN:', bin);
    if (bin.length === 6) {
      console.log('entrou');
      fetchCardBrand(bin);
    } else {
      setCardBrand('');
      setCardBrandIcon(null);
    }
  }, [cardData.cardNumber]);

  const [mp, setMp] = useState<any>(null);

  useEffect(() => {
    // Carregar o SDK do Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      if ((window as any).MercadoPago) {
        // Criar instância do Mercado Pago
        const mpInstance = new (window as any).MercadoPago('APP_USR-3e273da5-e31c-4626-ad9a-8cd0e466b19a', { locale: 'pt-BR' });
        setMp(mpInstance);
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen py-8">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-foreground mb-4 font-dancing">
              Carrinho vazio
            </h1>
            <p className="text-muted-foreground mb-8">
              Adicione alguns produtos ao carrinho antes de finalizar o pedido.
            </p>
            <Link href="/cardapio">
              <Button size="lg" variant="hero">
                Ver Cardápio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 relative">
      {/* Overlay de loading Pix */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
            <span className="text-white text-lg font-semibold">Processando pagamento Pix...</span>
          </div>
        </div>
      )}
      <div className="container px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/carrinho">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground font-dancing">
              Finalizar Pedido
            </h1>
            <p className="text-muted-foreground">
              Preencha os dados para completar sua compra
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form className="space-y-6">
              {/* Customer Info */}
              <Card className="shadow-card border-primary/10">
                <CardHeader>
                  <CardTitle>Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Nome Completo <span style={{color: 'red'}}>*</span></Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                        <Label htmlFor="phone">WhatsApp <span style={{color: 'red'}}>*</span></Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(21) 99999-9999"
                        required
                        maxLength={15}
                        inputMode="tel"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card className="shadow-card border-primary/10">
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Endereço <span style={{color: 'red'}}>*</span></Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Ex: Rua das Flores"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="number">Número <span style={{color: 'red'}}>*</span></Label>
                      <Input
                        id="number"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        name="complement"
                        value={formData.complement}
                        onChange={handleInputChange}
                        placeholder="Apto 45, Bloco B"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade <span style={{color: 'red'}}>*</span></Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighborhood">Bairro <span style={{color: 'red'}}>*</span></Label>
                      <Input
                        id="neighborhood"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        placeholder="Centro"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">CEP <span style={{color: 'red'}}>*</span></Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Coupon */}
              <Card className="shadow-card border-primary/10">
                <CardHeader>
                  <CardTitle>Adicionar Cupom</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="coupon"
                      name="coupon"
                      value={formData.coupon}
                      onChange={handleInputChange}
                      placeholder="Digite o código do cupom"
                      disabled={couponApplied}
                    />
                    <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={couponApplied}>
                      {couponApplied ? 'Cupom Aplicado' : 'Aplicar'}
                    </Button>
                  </div>
                  {couponError && <p className="text-destructive text-sm mt-2">{couponError}</p>}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="shadow-card border-primary/10">
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/10 transition-smooth">
                      <RadioGroupItem value="pix" id="pix" />
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <Label htmlFor="pix" className="cursor-pointer">PIX</Label>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/10 transition-smooth">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <Label htmlFor="card" className="cursor-pointer">Cartão de Crédito</Label>
                        <p className="text-sm text-muted-foreground">Parcelamento disponível</p>
                      </div>
                    </div>
                  </RadioGroup>
                  {/* Dados do Cartão */}
                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão *</Label>
                        <div className="relative flex items-center">
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            value={cardData.cardNumber}
                            onChange={e => {
                              // Aceita apenas números e espaço, formata em blocos de 4
                              let value = e.target.value.replace(/\D/g, '').slice(0, 16);
                              value = value.replace(/(.{4})/g, '$1 ').trim();
                              setCardData(prev => ({ ...prev, cardNumber: value }));
                            }}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            required
                            inputMode="numeric"
                            autoComplete="cc-number"
                          />
                          {cardBrandIcon && (
                            <img
                              src={cardBrandIcon}
                              alt={cardBrand}
                              className="absolute right-3 h-7 w-7"
                              style={{ background: '#fff', borderRadius: 4 }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Validade *</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            value={cardData.expiryDate}
                            onChange={e => {
                              // Formata MM/AA
                              let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                              if (value.length > 2) value = value.slice(0,2) + '/' + value.slice(2);
                              setCardData(prev => ({ ...prev, expiryDate: value }));
                            }}
                            placeholder="MM/AA"
                            maxLength={5}
                            required
                            inputMode="numeric"
                            autoComplete="cc-exp"
                          />
                        </div>
                        <div>
                          <Label htmlFor="securityCode">CVV *</Label>
                          <Input
                            id="securityCode"
                            name="securityCode"
                            value={cardData.securityCode}
                            onChange={e => {
                              let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setCardData(prev => ({ ...prev, securityCode: value }));
                            }}
                            placeholder="123"
                            maxLength={4}
                            required
                            inputMode="numeric"
                            autoComplete="cc-csc"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardholderName">Nome do Titular *</Label>
                        <Input
                          id="cardholderName"
                          name="cardholderName"
                          value={cardData.cardholderName}
                          onChange={handleCardInputChange}
                          placeholder="Nome como está no cartão"
                          required
                          autoComplete="cc-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="identificationNumber">CPF do Titular *</Label>
                        <Input
                          id="identificationNumber"
                          name="identificationNumber"
                          value={cardData.identificationNumber}
                          onChange={e => {
                            // Aceita apenas números, formata 000.000.000-00
                            let value = e.target.value.replace(/\D/g, '').slice(0, 11);
                            if (value.length > 9) value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                            else if (value.length > 6) value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
                            else if (value.length > 3) value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
                            setCardData(prev => ({ ...prev, identificationNumber: value }));
                          }}
                          placeholder="000.000.000-00"
                          required
                          inputMode="numeric"
                        />
                      </div>
                      
                      {/* Novos campos para aumentar confiabilidade */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardholderPhone">Telefone do Titular *</Label>
                          <Input
                            id="cardholderPhone"
                            name="cardholderPhone"
                            value={cardData.cardholderPhone}
                            onChange={e => {
                              // Aceita apenas números, máximo 11 dígitos (DDD + número)
                              let value = e.target.value.replace(/\D/g, '').slice(0, 11);
                              setCardData(prev => ({ ...prev, cardholderPhone: value }));
                            }}
                            placeholder="11999999999"
                            required
                            inputMode="numeric"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardholderEmail">E-mail do Comprador *</Label>
                          <Input
                            id="cardholderEmail"
                            name="cardholderEmail"
                            type="email"
                            value={cardData.cardholderEmail}
                            onChange={handleCardInputChange}
                            placeholder="email@exemplo.com"
                            required
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      
                      {/* Endereço de Cobrança */}
                      {/* 
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3 text-foreground">Endereço de Cobrança</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="billingAddress.zipCode">CEP *</Label>
                              <Input
                                id="billingAddress.zipCode"
                                name="billingAddress.zipCode"
                                value={cardData.billingAddress.zipCode}
                                onChange={e => {
                                  // Formata CEP 00000-000
                                  let value = e.target.value.replace(/\D/g, '').slice(0, 8);
                                  if (value.length > 5) value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
                                  setCardData(prev => ({
                                    ...prev,
                                    billingAddress: { ...prev.billingAddress, zipCode: value }
                                  }));
                                }}
                                placeholder="00000-000"
                                required
                                inputMode="numeric"
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingAddress.state">Estado (UF) *</Label>
                              <Input
                                id="billingAddress.state"
                                name="billingAddress.state"
                                value={cardData.billingAddress.state}
                                onChange={e => {
                                  // Aceita apenas letras, máximo 2 caracteres, maiúsculas
                                  let value = e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
                                  setCardData(prev => ({
                                    ...prev,
                                    billingAddress: { ...prev.billingAddress, state: value }
                                  }));
                                }}
                                placeholder="SP"
                                required
                                maxLength={2}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="billingAddress.street">Rua *</Label>
                            <Input
                              id="billingAddress.street"
                              name="billingAddress.street"
                              value={cardData.billingAddress.street}
                              onChange={handleCardInputChange}
                              placeholder="Ex: Rua das Flores"
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="billingAddress.number">Número *</Label>
                              <Input
                                id="billingAddress.number"
                                name="billingAddress.number"
                                value={cardData.billingAddress.number}
                                onChange={handleCardInputChange}
                                placeholder="123"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingAddress.complement">Complemento</Label>
                              <Input
                                id="billingAddress.complement"
                                name="billingAddress.complement"
                                value={cardData.billingAddress.complement}
                                onChange={handleCardInputChange}
                                placeholder="Apto 45, Bloco B"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="billingAddress.neighborhood">Bairro</Label>
                              <Input
                                id="billingAddress.neighborhood"
                                name="billingAddress.neighborhood"
                                value={cardData.billingAddress.neighborhood}
                                onChange={handleCardInputChange}
                                placeholder="Centro"
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingAddress.city">Cidade *</Label>
                              <Input
                                id="billingAddress.city"
                                name="billingAddress.city"
                                value={cardData.billingAddress.city}
                                onChange={handleCardInputChange}
                                placeholder="São Paulo"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      */}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Observações */}
              <Card className="shadow-card border-primary/10">
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="observations"
                    value={formData.observations}
                    onChange={handleInputChange}
                    placeholder="Alguma observação especial sobre o pedido? (opcional)"
                    rows={3}
                  />
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-card border-primary/10 sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                    {/* Cupom aplicado - desconto */}
                    {couponApplied && couponValue > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto aplicado</span>
                        <span>-{formatPrice(couponValue)}</span>
                      </div>
                    )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.paymentMethod === 'pix' && (
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                      onClick={handlePixPayment}
                    >
                      <Smartphone className="mr-2 h-5 w-5" />
                      Pagar com PIX
                    </Button>
                  )}
                  {formData.paymentMethod === 'card' && (
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handleCardPayment}
                      disabled={isLoadingCard}
                      type="button"
                    >
                      {isLoadingCard ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Pagar com Cartão de Crédito
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;