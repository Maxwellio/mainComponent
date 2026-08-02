import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../../services/api';

export const useFetchData = <T,> (
    url:String,
    id:String | Number | undefined,
    mode:'lazy' | 'eager' = 'lazy'
) => {
    const api = useApi(); //обязательно использовать <AxiosProvider>
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
 
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (mode === 'lazy' && id == null) {
                    throw new Error('Для lazy-режима требуется rootId');
                }
                const reqApi = mode === 'eager' ? `${url}` : `${url}/${id}`;
                const responseData = (await api.get(reqApi)).data;
                setData(mode === 'eager' ? responseData : Array.of(responseData));
                setError(null);
            } catch(err){
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url, id, mode]);

    const fetchChildren = useCallback(async (parentId,) => {
        if (mode !== 'lazy') {
            return;
        }
        const reqApi = `${url}/${parentId}/children`;
        const children = (await api.get(reqApi)).data;
        setData(prev => {
            const updateNode = (nodes) =>{
                return nodes.map(node => {         
                    if (node.id  === parentId && !node.hasLoaded){
                        return {...node, children: children, hasLoaded: true};
                    }
                    if (node.children) {
                        return {...node, children: updateNode(node.children), hasLoaded: true}
                    }
                    return node;
                })
            }
            return updateNode(prev);
        })        
        
    }, [url, mode])

    return {
        data,
        loading,
        setData,
        fetchChildren
    }
};
