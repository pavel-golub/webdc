import React, {useState} from 'react';
import {DataGrid, GridColDef, GridRowModel, GridRowsProp} from '@mui/x-data-grid';
import {Dive} from "./dc/diveProfile";

type DivesGridProps = {
    dives: Dive[]
}

export const DivesGrid = function ({dives}: DivesGridProps) {

    // const [divesState, setDives] = useState<GridRowsProp>(dives);

    const columns: GridColDef[] = [
        {field: 'date', headerName: 'Date', width: 150},
        {field: 'diveTime', headerName: 'Duration', width: 150},
        {field: 'airTemperature', headerName: 'Surface Temp', width: 150},
        {field: 'maxDepth', headerName: 'Max Depth', width: 150},
    ];

    // @ts-ignore
    return (
        <DataGrid rows={dives} columns={columns}/>
    );
}
