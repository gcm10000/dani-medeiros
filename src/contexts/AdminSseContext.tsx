"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { orderService } from "@/services/orderService";
import { usePathname } from "next/navigation";
import { Howl } from "howler";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

type AdminSseContextType = {
  messages: string[];
  status: ConnectionStatus;
  newOrders: any[];
  soundEnabled: boolean;
  enableSound: () => void;
  acceptOrder: (orderId: number) => void;
  cancelOrder: (orderId: number) => void;
};

const AdminSseContext = createContext<AdminSseContextType | undefined>(undefined);

export const AdminSseProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [newOrders, setNewOrders] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // --- Howler setup ---
  const newOrderSoundRef = useRef<Howl | null>(null);
  const paidOrderSoundRef = useRef<Howl | null>(null);
  const audioUnlockedRef = useRef(false);

  const pendingPaidOrdersRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // inicializa sons
    newOrderSoundRef.current = new Howl({ src: ["/audios/new-order.mp3"], volume: 1 });
    paidOrderSoundRef.current = new Howl({ src: ["/audios/paid-order.mp3"], loop: true, volume: 1 });

    // função para desbloquear áudio na primeira interação
    const unlockAudio = () => {
      if (!audioUnlockedRef.current) {
        // toca silenciosamente para desbloquear (apenas 1x, sem loop)
        newOrderSoundRef.current?.volume(0);
        newOrderSoundRef.current?.play();
        newOrderSoundRef.current?.once("end", () => newOrderSoundRef.current?.volume(1));

        // desbloqueia também o som de pago, mas SEM loop
        const tmpPaid = new Howl({ src: ["/audios/paid-order.mp3"], volume: 0 });
        tmpPaid.play();
        tmpPaid.once("end", () => tmpPaid.unload()); // descarrega para liberar memória

        audioUnlockedRef.current = true;
        setSoundEnabled(true);
        soundEnabledRef.current = true;
        console.log("Áudio desbloqueado pelo usuário");
      }
    };

    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchend", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchend", unlockAudio);
    };
  }, []);

  const enableSound = () => {
    if (!newOrderSoundRef.current || !paidOrderSoundRef.current) return;
    audioUnlockedRef.current = true;
    setSoundEnabled(true);
    soundEnabledRef.current = true;
    console.log("Som habilitado manualmente");
  };

  // --- Funções para tocar/pausar som de pedido pago ---
  const playPaidOrderSound = () => {
    if (paidOrderSoundRef.current && pendingPaidOrdersRef.current.size > 0 && !paidOrderSoundRef.current.playing()) {
      paidOrderSoundRef.current.play();
    }
  };

  const stopPaidOrderSound = () => {
    paidOrderSoundRef.current?.stop();
  };

  // --- SSE setup ---
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startKeepAlive = () => {
    if (keepAliveIntervalRef.current) return;
    keepAliveIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("https://danimedeiros-production.up.railway.app/api/date");
        const data = await res.text();
        console.log("Keep-alive resposta:", data);
      } catch (e) {
        console.error("Erro ao buscar /api/date:", e);
      }
    }, 5000);
  };

  const stopKeepAlive = () => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  };

  const connect = () => {
    if (!isAdminRoute || eventSourceRef.current) return;

    setStatus("connecting");
    const es = orderService.createNewOrdersSSEConnection();
    eventSourceRef.current = es;

    es.addEventListener("connected", (event) => {
      console.log("Conectado SSE:", event.data);
      setStatus("connected");
      startKeepAlive();
    });

    es.addEventListener("orderCreated", (event) => {
      console.log("Novo pedido:", event.data);
      setMessages(prev => [...prev, event.data]);

      if (audioUnlockedRef.current && newOrderSoundRef.current) {
        newOrderSoundRef.current.play();
      }
      
      try {
        const order = JSON.parse(event.data);
        setNewOrders(prev => [...prev, order]);
      } catch {
        setNewOrders(prev => [...prev, event.data]);
      }
    });

    // --- listener para status do pedido ---
    es.addEventListener("orderStatusChangedAdmin", (event) => {
      try {
        debugger;
        const order = JSON.parse(event.data);
        // adiciona à fila de alertas se for pago e novo
        if (order.orderStatusId === 0 && order.paymentStatusId === 1) {
          pendingPaidOrdersRef.current.add(order.id);
          playPaidOrderSound();
        }
      } catch (e) {
        console.error("Erro parse orderStatusChangedAdmin:", e);
      }
    });

    es.onerror = (err) => {
      console.error("Erro SSE:", err);
      setStatus("error");

      es.close();
      eventSourceRef.current = null;
      stopKeepAlive();

      if (isAdminRoute && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, 5000);
      }
    };
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    stopKeepAlive();
    setStatus("disconnected");
    console.log("SSE desconectado");
  };

  useEffect(() => {
    if (isAdminRoute) connect();
    else disconnect();
    return () => disconnect();
  }, [isAdminRoute]);

  // --- Funções públicas para aceitar/cancelar pedidos pagos ---
  const acceptOrder = (orderId: number) => {
    pendingPaidOrdersRef.current.delete(orderId);
    if (pendingPaidOrdersRef.current.size === 0) stopPaidOrderSound();
    orderService.markAsConfirmed(orderId);
  };

  const cancelOrder = (orderId: number) => {
    pendingPaidOrdersRef.current.delete(orderId);
    if (pendingPaidOrdersRef.current.size === 0) stopPaidOrderSound();
    orderService.cancelOrder(orderId);
  };

  return (
    <AdminSseContext.Provider value={{ 
      messages, 
      status, 
      newOrders, 
      soundEnabled, 
      enableSound,
      acceptOrder,
      cancelOrder
    }}>
      {children}
    </AdminSseContext.Provider>
  );
};

export const useAdminSse = () => {
  const ctx = useContext(AdminSseContext);
  if (!ctx) throw new Error("useAdminSse deve ser usado dentro de AdminSseProvider");
  return ctx;
};
