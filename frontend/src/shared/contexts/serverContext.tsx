"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Server } from "@/shared/types/server";

interface ServerContextType {
  selectedServer: Server | null;
  setSelectedServer: (server: Server | null) => void;
  clearSelectedServer: () => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

const SELECTED_SERVER_KEY = "auth-service-selected-server";

interface ServerProviderProps {
  children: ReactNode;
}

export function ServerProvider({ children }: ServerProviderProps) {
  const [selectedServer, setSelectedServerState] = useState<Server | null>(
    null
  );

  // Загружаем сохраненный сервер из localStorage при инициализации
  useEffect(() => {
    try {
      const savedServer = localStorage.getItem(SELECTED_SERVER_KEY);
      if (savedServer) {
        const server = JSON.parse(savedServer) as Server;
        setSelectedServerState(server);
      }
    } catch (error) {
      console.error("Error loading server from localStorage:", error);
    }
  }, []);

  // Функция для установки сервера и сохранения в localStorage
  const setSelectedServer = (server: Server | null) => {
    setSelectedServerState(server);

    if (server) {
      try {
        localStorage.setItem(SELECTED_SERVER_KEY, JSON.stringify(server));
      } catch (error) {
        console.error("Error saving server to localStorage:", error);
      }
    } else {
      try {
        localStorage.removeItem(SELECTED_SERVER_KEY);
      } catch (error) {
        console.error("Error removing server from localStorage:", error);
      }
    }
  };

  // Функция для очистки выбранного сервера
  const clearSelectedServer = () => {
    setSelectedServer(null);
  };

  const value: ServerContextType = {
    selectedServer,
    setSelectedServer,
    clearSelectedServer,
  };

  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
}

export function useServerContext() {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error("useServerContext must be used within a ServerProvider");
  }
  return context;
}
