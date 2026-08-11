import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../services/api";

const globalSelectCache = new Map<string, Promise<any>>();

export const useFetchSelectContent = <T,> (contentApi, params?) => {
    const [content, setContent] = useState<T[]>([]);
    const [loadingContent, setLoadingContent] = useState<boolean>(false);
    const api = useApi();   
    const fetchData = useCallback(async (params, abortSignal) => {
        if (loadingContent) return;
        setLoadingContent(true);
        try {
            const reqApi = contentApi;
                       
            const data = (await api.get(reqApi, {params, signal: abortSignal }));
            if (data.status !== 200){
                throw new Error("Ошибка загрузки")
            }
            setContent(data.data);
        } catch(err){
            if (axios.isCancel(err)) {
            } else {
                console.error(err.message);
            }
        } finally {
            setLoadingContent(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchData(params, controller.signal);  
        return () => controller.abort();      
    }, [fetchData, JSON.stringify(params)]);

    return {
        content,
        loadingContent
    }
};

export const useMultiFetchSelectContent = <T,>(contentApi: any, params?: any) => {
    const api = useApi();
    const [content, setContent] = useState<T[]>([]);
    const [loadingContent, setLoadingContent] = useState<boolean>(false);

    // Запоминаем строковое представление параметров, чтобы избежать лишних триггеров useCallback
    const stringifiedParams = JSON.stringify(params);

    const fetchData = useCallback(async (currentParams: any, abortSignal: AbortSignal) => {
        if (!contentApi) return;

        // 2. Создаем уникальный ключ для кэша на основе ссылки и переданных параметров
        const cacheKey = `${contentApi}_${JSON.stringify(currentParams)}`;

        setLoadingContent(true);

        try {
            // 3. Если такого запроса в этот момент времени еще нет — создаем его
            if (!globalSelectCache.has(cacheKey)) {
                const networkPromise = api.get(contentApi, { 
                    params: currentParams, 
                    signal: abortSignal 
                })
                .then(response => {
                    if (response.status !== 200) {
                        throw new Error("Ошибка загрузки");
                    }
                    return response.data; // Возвращаем чистый массив данных из промиса
                })
                .catch(err => {
                    // Если запрос упал по ошибке сети (а не был отменен AbortController-ом), 
                    // удаляем его из кэша, чтобы система могла попытаться сделать его снова
                    if (!axios.isCancel(err)) {
                        globalSelectCache.delete(cacheKey);
                    }
                    throw err;
                });

                globalSelectCache.set(cacheKey, networkPromise);
            }

            // 4. Все ячейки одновременно подписываются на один и тот же глобальный Promise
            const data = await globalSelectCache.get(cacheKey);
            
            // Если компонент еще существует на экране — сохраняем данные в его локальный стейт
            setContent(data);

        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error(err instanceof Error ? err.message : String(err));
            }
        } finally {
            setLoadingContent(false);
        }
    }, [contentApi]); // Хук пересоздается только при изменении самого URL-адреса

    // 5. Контролируем вызовы эффекта загрузки
    useEffect(() => {
        const controller = new AbortController();
        
        // Передаем распарсенные обратно параметры
        const parsedParams = stringifiedParams ? JSON.parse(stringifiedParams) : undefined;
        fetchData(parsedParams, controller.signal);

        return () => {
            controller.abort(); // Отменяем запрос при быстром переключении ячеек
        };
    }, [fetchData, stringifiedParams]);

    return {
        content,
        loadingContent
    };
};
