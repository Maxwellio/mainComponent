import axios, { AxiosInstance } from 'axios';
import React, { createContext, ReactNode, useContext, useMemo } from 'react'; // 👈 Добавьте React сюда

interface AxiosContextType {
    api: AxiosInstance;
  }
  
  const AxiosContext = createContext<AxiosContextType | undefined>(undefined);
  
  // 1. Принимаем baseapi извне как проп
  interface AxiosProviderProps {
    children: ReactNode;
    baseapi: string; 
  }
  
  export function AxiosProvider({ children, baseapi }: AxiosProviderProps) {
    const api = useMemo(() => {
      const instance = axios.create({
        baseURL: baseapi, // Подставляется динамически
        timeout: 10000000,
        headers: { 'Content-Type': 'application/json' },
      });
  
      instance.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
  
      return instance;
    }, [baseapi]); // Пересоздастся, только если изменится адрес
  
    return <AxiosContext.Provider value={{ api }}>{children}</AxiosContext.Provider>;
  }
  
  export function useApi() {
    const context = useContext(AxiosContext);
    if (!context) throw new Error('useApi должен использоваться внутри AxiosProvider');
    return context.api;
  }
