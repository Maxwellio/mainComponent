import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, getExpandedRowModel, getPaginationRowModel, TableOptions, useReactTable } from "@tanstack/react-table";
import React, { useState } from "react";
import { useFetchData } from "../BaseTable/hooks/useFetchTreeData";

interface CommonBaseTreeTableProps<TData> extends Partial<TableOptions<TData>>{
    url: string;
    columns: ColumnDef<TData>[];
    treeColumnId?: string;
    setSelectedId?: any;
    setIsLeaf?:any;
    defColumnVisibility?: VisibilityState;
}

type BaseTreeTableProps<TData> = CommonBaseTreeTableProps<TData> & (
    { mode?: 'lazy'; rootId: string | number }
    | { mode: 'eager'; rootId?: never }
);

export const BaseTreeTable = <TData,>({url, columns, treeColumnId, mode = 'lazy', rootId, setSelectedId, setIsLeaf, defColumnVisibility, ...props}: BaseTreeTableProps<TData>) =>{
    const {data, loading, setData, fetchChildren} = useFetchData<TData>(url, rootId, mode);
    const [expanded, setExpanded] = useState({});
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defColumnVisibility || {})
    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
            columnVisibility,
         },
        getCoreRowModel: getCoreRowModel(),
        //@ts-ignore
        getRowCanExpand: row => row.original.hasChildren,
        getExpandedRowModel: getExpandedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        //@ts-ignore
        getSubRows: row => row.children,
        onExpandedChange: (updater) => {  
            //@ts-ignore
            const newExpanded = updater(expanded);
            Object.keys(newExpanded)
                .filter(id => newExpanded[id] && !expanded[id])
                .forEach(rowId => {
                    const row = table.getRow(rowId);
                    //@ts-ignore                    
                    if (row.getCanExpand() && !row.original.children) {
                        //@ts-ignore
                        fetchChildren(row.original.id);
                }});
            setExpanded(newExpanded);
        },
        manualPagination: true,
        enableSubRowSelection: false,
        ...props,
    });

    const handleRowClick = (row) => {        
        if (row.id){
            if(setSelectedId){
                setSelectedId(row.original.id);
            }
            if(setIsLeaf){
                setIsLeaf(!row.original.hasChildren);
            }
        }        
    };
    
    return(
        <div className="min-w-full min-h-full overflow-auto">
        <table className="min-w-full bg-white rounded-lg table-auto">
            <thead className="bg-gray-100 text-white">
                {table.getHeaderGroups().map(headerGroup => (
                        <tr key = {headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key = {header.id}
                                className=" px-1 py-2 text-center shrink-0 overflow-hidden text-ellipsis bg-[#F0F4FF] text-[#364FC7] border border-t font-medium text-sm whitespace-pre-line break-words hyphens-auto">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>    
                            ))}
                        </tr>
                ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map(row =>(
                    <tr key = {row.id} 
                    className={`hover:bg-[#E7F0FF] transition-colors duration-150 
                        ${row.getIsSelected()
                        ? 'bg-[#D0EBFF] even:bg-[#D0EBFF] hover:bg-[#B1D7FF] shadow-[inset_3px_0_0_0_#364FC7]'
                        : 'bg-white even:bg-[#F8FAFF]'}
                    `}
                        onClick={(e) => {
                        if (!row.getIsSelected()){
                            table.resetRowSelection();
                        }
                        row.toggleSelected(true);}}
                    >
                        {row.getVisibleCells().map(cell => (
                            <td key = {cell.id} 
                                onClick={() => handleRowClick(row)}
                                className="px-4 py-2 border text-sm text-gray- overflow-hedden overflow-ellipsis whitespase-nowrap"
                            >
                                <div
                                    className="max-h-10 overflow-y-auto"
                                    style={cell.column.id === treeColumnId
                                        ? { paddingLeft: `${row.depth * 16}px` }
                                        : undefined}
                                >
                                    {cell.column.id === treeColumnId && row.getCanExpand() ? (
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                row.getToggleExpandedHandler()();
                                            }}
                                        >
                                            {row.getIsExpanded() ? '▾' : '▸'}
                                        </button>
                                    ) : null}
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
};
