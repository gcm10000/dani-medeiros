"use client";

import { useAdminSse } from "@/contexts/AdminSseContext";

const ConnectionStatusIndicator = () => {
  const { status } = useAdminSse();

  return (
    <div className="flex items-center gap-4">
        {/* Friendly status with colored dot */}
        {status === 'connected' && (
        <>
            <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
            <span className="text-green-700 font-medium">Conectado</span>
        </>
        )}
        {status === 'connecting' && (
        <>
            <span className="h-2 w-2 rounded-full bg-yellow-400 inline-block animate-pulse"></span>
            <span className="text-yellow-700 font-medium">Conectando...</span>
        </>
        )}
        {status === 'disconnected' && (
        <>
            <span className="h-2 w-2 rounded-full bg-gray-400 inline-block"></span>
            <span className="text-gray-700 font-medium">Desconectado</span>
        </>
        )}
        {status === 'error' && (
        <>
            <span className="h-2 w-2 rounded-full bg-red-500 inline-block animate-pulse"></span>
            <span className="text-red-700 font-medium">Erro de conexão</span>
        </>
        )}
    </div>
  )
}

export default ConnectionStatusIndicator;