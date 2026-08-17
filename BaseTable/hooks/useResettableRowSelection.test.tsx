import { act, renderHook } from '@testing-library/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { describe, expect, it } from 'vitest';
import { useResettableRowSelection } from './useResettableRowSelection';

type Person = { id: number; name: string };

function useSelectableTable(data: Person[], reRenderSignal: number) {
    const [rowSelection, setRowSelection] = useResettableRowSelection(reRenderSignal);
    return useReactTable({
        data,
        columns: [{ accessorKey: 'name', header: 'Name' }],
        state: { rowSelection },
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
    });
}

describe('useResettableRowSelection', () => {
    it('clears table selection when reRenderSignal changes after a row is removed', () => {
        const initial = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Carol' },
        ];

        const { result, rerender } = renderHook(
            ({ data, signal }) => useSelectableTable(data, signal),
            { initialProps: { data: initial, signal: 0 } },
        );

        act(() => {
            result.current.getRow('1').toggleSelected(true);
        });
        expect(result.current.getRow('1').getIsSelected()).toBe(true);

        // Как в burnar после удаления пользователя: данные перезапрашиваются,
        // строка сдвигается на прежний индекс, signal инкрементируется.
        rerender({
            data: [
                { id: 1, name: 'Alice' },
                { id: 3, name: 'Carol' },
            ],
            signal: 1,
        });

        expect(result.current.getSelectedRowModel().rows).toHaveLength(0);
        expect(result.current.getRowModel().rows.every((row) => !row.getIsSelected())).toBe(true);
    });

    it('keeps selection when reRenderSignal is unchanged', () => {
        const data = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ];

        const { result, rerender } = renderHook(
            ({ signal }) => useSelectableTable(data, signal),
            { initialProps: { signal: 0 } },
        );

        act(() => {
            result.current.getRow('0').toggleSelected(true);
        });
        expect(result.current.getRow('0').getIsSelected()).toBe(true);

        rerender({ signal: 0 });
        expect(result.current.getRow('0').getIsSelected()).toBe(true);
    });
});
