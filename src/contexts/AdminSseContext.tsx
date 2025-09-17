// contexts/AdminSseContext.tsx
import { orderService } from "@/services/orderService";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

type AdminSseContextType = {
  messages: string[];
  status: ConnectionStatus;
  newOrders: any[];
  soundEnabled: boolean;
  enableSound: () => void;
};

const AdminSseContext = createContext<AdminSseContextType | undefined>(undefined);

export const AdminSseProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [newOrders, setNewOrders] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const enableSound = () => {
    const audio = new Audio("/audios/new-order.mp3");
    audio.volume = 1;
    audio.play().then(() => {
      setSoundEnabled(true);
      soundEnabledRef.current = true;
      console.log("Som habilitado pelo usuário");
    }).catch(err => {
      console.warn("Não foi possível habilitar som:", err);
    });
  };

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
      console.log("Evento de conexão recebido:", event.data);
      setStatus("connected");
      startKeepAlive(); // inicia o keep-alive quando conectar
    });

    es.addEventListener("orderCreated", (event) => {
      console.log("Novo pedido recebido:", event.data);
      setMessages((prev) => [...prev, event.data]);

      if (soundEnabledRef.current) {
        try {
          const audio = new Audio("/audios/new-order.mp3");
          audio.volume = 1;
          audio.play();
        } catch {}
      }

      try {
        const order = JSON.parse(event.data);
        const normalizeKey = (key: string) => key.charAt(0).toLowerCase() + key.slice(1);
        const normalizeObj = (obj: any): any => {
          if (Array.isArray(obj)) return obj.map(normalizeObj);
          if (obj && typeof obj === "object") {
            const out: any = {};
            for (const k in obj) {
              out[normalizeKey(k)] = normalizeObj(obj[k]);
            }
            return out;
          }
          return obj;
        };
        const normalizedOrder = normalizeObj(order);
        setNewOrders((prev) => [...prev, normalizedOrder]);
      } catch {
        setNewOrders((prev) => [...prev, event.data]);
      }
    });

    es.onerror = (err) => {
      console.error("Erro SSE:", err);
      setStatus("error");

      es.close();
      eventSourceRef.current = null;
      stopKeepAlive(); // para o keep-alive se cair

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
    stopKeepAlive(); // para sempre que desconectar
    setStatus("disconnected");
    console.log("SSE desconectado");
  };

  useEffect(() => {
    if (isAdminRoute) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAdminRoute]);

  return (
    <AdminSseContext.Provider value={{ messages, status, newOrders, soundEnabled, enableSound }}>
      {children}
    </AdminSseContext.Provider>
  );
};

export const useAdminSse = () => {
  const ctx = useContext(AdminSseContext);
  if (!ctx) throw new Error("useAdminSse deve ser usado dentro de AdminSseProvider");
  return ctx;
};
