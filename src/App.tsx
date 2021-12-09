import Box from '@mui/material/Box';
import { useState } from 'react';
import { PortSelector } from "./PortSelector";
import { Grid, ThemeProvider, Typography } from "@mui/material";
import { createTheme } from '@mui/material/styles';
import { Progress } from "./dc/progress";
import { SuuntoVyperDevice } from "./dc/suuntoVyperDevice";
import { DivesGrid } from "./DivesGrid";
import { Dive } from "./dc/diveProfile";
import LinearProgressWithLabel from './LinearProgressWithLabel';

const theme = createTheme({
    palette: {
        primary: {
            main: '#fbaf17',
        },
        secondary: {
            main: '#f50057',
        },
    },
});

function App() {
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0);
    const [dives, setDives] = useState<Array<Dive>>(new Array<Dive>());
    let dvs = new Array<Dive>();

    //setup progress indicator
    let updateProgress = function (event: Progress) {
        setProgress(event.total === 0 ? 0 : (event.current / event.total) * 100);
    }

    function addDive(dive: Dive) {
        dvs.push(dive);
        setDives(dvs.map((x) => x));
    }

    //setup
    let getDivesCallback = async function (port: SerialPort) {
        let device = new SuuntoVyperDevice(port, updateProgress);
        try {
            console.info(`Device info: ${await device.open()}`);
            await device.getDives(addDive);
        } catch (e) {
            //TODO: show error on screen as well
            console.error(e);
            setError((e as Error).message);
        } finally {
            await device.close()
        }
    }

    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <Grid container>
                <Grid item xs={3}></Grid>
                <Grid item xs={6}>
                    <Box sx={{ height: 100 }} />
                    <PortSelector getDivesCallback={getDivesCallback} />
                    <LinearProgressWithLabel value={progress} />
                    <Typography variant='body2' color="error" marginBottom={2}>{error}</Typography>
                    <DivesGrid dives={dives} />
                    <Grid item xs={3} />
                </Grid>
            </Grid>
        </ThemeProvider >
    );
}

export default App;