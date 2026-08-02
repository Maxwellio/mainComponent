import axios from 'axios';
import { useEffect, useState } from 'react';
import { useApi } from '../../services/api';

export const useFetchData = <T,> (url:string, columnFilters: Record<string,any>, pageable: boolean, reRenderSignal:any) => {
    const api = useApi(); //обязательно использовать <AxiosProvider>
    const [data, setData] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [error, setError] = useState(null);
    const [totalElements, setTotalElements] =  useState(null);
    const [pagination, setPagination] = useState({
        pageIndex : 0,
        pageSize : 100
    });
    if (pageable)
    {
        const fetchData = async (pageSize, pageIndex, filters) => { 
            const newfilers = filters.reduce((acc, filter) => {
                if (filter.value !== undefined && filter.value !== null && String(filter.value).trim() !== '') {
                    acc[filter.id] = filter.value;
                }
                return acc;
            }, {});

            if (loading) return;
            if (pageIndex === 0){
                setData([]);
            }
            setLoading(true);
            try {
                const params = {
                    page: pageIndex,
                    size: pageSize,
                    ...newfilers
                }
                const reqApi = `${url}`;           
                const data = (await api.get(reqApi, {params })).data;
                
                setTotal(data.totalPages);
                setTotalElements(data.totalElements);
                if (pageIndex === 0) {
                    setData([...data.content]);
                } else {
                    setData(prev => [...prev, ...data.content]);
                }
                
                setError(null);
            } catch(err){
                if (axios.isCancel(err)) {
                } else {
                    console.error(err.message);
                }
            } finally {
                setLoading(false);
            }
            
        };

        useEffect(() => {
            fetchData(pagination.pageSize, 0, columnFilters);
        }, [JSON.stringify(columnFilters), reRenderSignal]);

        useEffect(() => {
            if (pagination.pageIndex > 0) {
                fetchData(pagination.pageSize, pagination.pageIndex, columnFilters);
            }            
        }, [pagination.pageIndex, pagination.pageSize, reRenderSignal]);

    } else {
        const fetchData = async (filters) => { 
            const newfilers = filters.reduce((acc, filter) => {
                acc[filter.id] = filter.value
                return acc;
            }, {});
            
            setLoading(true);
            try {
                const params = {
                    ...newfilers
                }
                const reqApi = `${url}`;            
                const data = (await api.get(reqApi, {params})).data;                    
                if (data.numberOfElements === 0){
                    return;
                }
                setData(data);
                setError(null);
            } catch(err){
                console.error(err.message, error);
            } finally {
                setLoading(false);
            }
        };
        useEffect(() => {
            fetchData(columnFilters);   
        }, [JSON.stringify(columnFilters), reRenderSignal])
    }


    return {
        data,
        total,
        loading,
        pagination,
        hasMore,
        totalElements,
        setPagination,
        setData
    }
};
