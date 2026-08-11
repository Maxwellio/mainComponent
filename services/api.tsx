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
        usecsrftoken: boolean;
    }

    function getCSRFToken() {
        const name = 'csrftoken';
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(name))
            ?.split('=')[1];
            return cookieValue;
    }

    
    export function AxiosProvider({ children, baseapi, usecsrftoken = false }: AxiosProviderProps) {
        const api = useMemo(() => {
            const instance = axios.create({
                baseURL: baseapi, // Подставляется динамически
                withCredentials: true,
                timeout: 10000000,
                headers: { 'Content-Type': 'application/json' },
            });
        
            // instance.interceptors.request.use(
            //     (config) => {
            //     const token = localStorage.getItem('token');
            //     if (token) {
            //         config.headers.Authorization = `Bearer ${token}`;
            //     }
            //     return config;
            //     },
            //     (error) => Promise.reject(error)
            // );

            if (usecsrftoken){
                instance.defaults.xsrfCookieName = 'csrftoken';
                instance.defaults.xsrfHeaderName = 'X-CSRFToken';
            }



            instance.interceptors.request.use(
                (config) => {
                    if (usecsrftoken) {
                        const csrfToken = getCSRFToken();
                        if (csrfToken) {
                            config.headers['X-CSRFToken'] = csrfToken;
                        }
                    } else {
                        const token = localStorage.getItem('token');
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }    
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );

            instance.interceptors.response.use(
                (response) => response,
                (error) => {
                const isNetworkError = error.code === 'ERR_NETWORK' || !error.response;
                const isUnauthorized = error.response && error.response.status === 401;
            
                if (isNetworkError) {
                    localStorage.removeItem('token');
                    if (window.location.hash !== '#/login') {
                        window.location.href = '/#/login';
                    }
                }
            
                return Promise.reject(error);
                }
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
