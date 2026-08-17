import { useEffect, useState } from 'react';
import type { OnChangeFn, RowSelectionState } from '@tanstack/react-table';

export const useResettableRowSelection = (
    resetSignal: unknown,
): [RowSelectionState, OnChangeFn<RowSelectionState>] => {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    useEffect(() => {
        setRowSelection((prev) => (Object.keys(prev).length === 0 ? prev : {}));
    }, [resetSignal]);

    return [rowSelection, setRowSelection];
};
