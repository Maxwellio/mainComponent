import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../../services/api';

export const useFetchData = <T,> (url:String, columnFilters: Record<string,any>, reRenderSignal:any) => {
    const api = useApi();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchData = async (filters) => {
            const newfilers = filters.reduce((acc, filter) => {
                if (filter.value !== undefined && filter.value !== null && String(filter.value).trim() !== '') {
                    acc[filter.id] = filter.value;
                }
                return acc;
            }, {});
            setLoading(true);
            try {
                const params = {
                    ...newfilers
                }
                const reqApi = String(url);
                const data = (await api.get(reqApi, {params})).data;
                setData(data);
                setError(null);
            } catch(err){
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData(columnFilters);
    }, [JSON.stringify(columnFilters), reRenderSignal]);

    const fetchChildren = useCallback(async (parentId,) => {
        const reqApi = `${url}/${parentId}/children`;
        const children = (await api.get(reqApi)).data;
        setData(prev => {
            const updateNode = (nodes) =>{
                return nodes.map(node => {
                    // Если узел родительский - вставляем
                    if (node.id  === parentId && !node.hasLoaded){
                        return {...node, children: children, hasLoaded: true};
                    }
                    // Обходим дерево в поиске родителя
                    if (node.children) {
                        return {...node, children: updateNode(node.children)}
                    }
                    // Возврат узла если дошли до конца и не нашли куда вставить
                    return node;
                })
            }
            return updateNode(prev);
        })        
        
    }, [])

    return {
        data,
        loading,
        setData,
        fetchChildren
    }
};

