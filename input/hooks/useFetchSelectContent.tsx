import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../services/api";

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
