import { DataGrid, GridColDef, GridRowModel } from '@mui/x-data-grid';
import { Dive } from "./dc/diveProfile";

type DivesGridProps = {
    dives: Dive[]
}

export const DivesGrid = function ({ dives }: DivesGridProps) {
    const meterFormatter = new Intl.NumberFormat('en-US', { style: 'unit', unit: 'meter', unitDisplay: 'short', maximumFractionDigits: 1 });
    const tempFormatter = new Intl.NumberFormat('en-US', { style: 'unit', unit: 'celsius', unitDisplay: 'short', maximumFractionDigits: 1 });

    const columns: GridColDef[] = [
        { field: 'date', headerName: 'Date', type: 'dateTime', width: 180 },
        { field: 'diveTime', headerName: 'Duration' },
        { field: 'airTemperature', type: "number", width: 120, headerName: 'Surface Temp', valueFormatter: ({ value }) => tempFormatter.format(Number(value)) },
        { field: 'maxDepth', headerName: 'Max Depth', type: "number", valueFormatter: ({ value }) => meterFormatter.format(Number(value)) },
    ];
    let getRowId = function (row: GridRowModel) {
        return row["date"];
    }
    // @ts-ignore
    return (
        <DataGrid rows={dives} columns={columns} getRowId={getRowId}/>
    );
}
