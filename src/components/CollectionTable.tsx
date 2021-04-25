import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table';
import React from 'react'
import { useTable } from 'react-table'

export interface ReactTableColumnProps {
    Header: string;
    accessor: string;
}

interface CollectionTableProps {
    data: object[];
    columns: ReactTableColumnProps[];
}

export const CollectionTable = (props: CollectionTableProps) => {
    const { data, columns } = props;
    // console.log({ props });
    const cdata = React.useMemo(
        () => data,
        []
    )

    const ccolumns = React.useMemo(
        () => columns,
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns: ccolumns, data: cdata })

    return (
        <Table
            {...getTableProps()}>
            <Thead>
                {headerGroups.map(headerGroup => (
                    <Tr bg="gray.100" {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <Th

                                {...column.getHeaderProps()}
                            >
                                {column.render('Header')}
                            </Th>
                        ))}
                    </Tr>
                ))}
            </Thead>
            <Tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row)
                    return (
                        <Tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return (
                                    <Td
                                        {...cell.getCellProps()}
                                    >
                                        {cell.render('Cell')}
                                    </Td>
                                )
                            })}
                        </Tr>
                    )
                })}
            </Tbody>
        </Table>
    )
}