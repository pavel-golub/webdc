import Box from '@mui/material/Box';
import { useRef, useState } from 'react';
// import logo from './logo.svg';
// import './App.css';
import { PortSelector } from "./PortSelector";
import { Container, Grid, TextField, ThemeProvider } from "@mui/material";
import { createTheme } from '@mui/material/styles';
import { logging } from "./log/LogManager";
import { Progress } from "./dc/progress";
import { SuuntoVyperDevice } from "./dc/suuntoVyperDevice";
import { DivesGrid } from "./DivesGrid";
import { Dive } from "./dc/diveProfile";
import LinearProgress from '@mui/material/LinearProgress';

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

logging
    .configure({
        minLevels: {
            '': 'debug',
            // 'core': 'warn'
        }
    })
    .registerConsoleLogger();


function App() {
    // setup logging
    let [log] = useState("");
    const [progress, setProgress] = useState(0);
    const [dives, setDives] = useState<Array<Dive>>(new Array<Dive>());
    let dvs = new Array<Dive>();
    logging.onLogEntry(logEntry => {
        log += `${logEntry.time.getHours()}:${logEntry.time.getMinutes()}:${logEntry.time.getSeconds()}.${logEntry.time.getMilliseconds()} ${logEntry.level.toUpperCase()} [${logEntry.module}] ${logEntry.message}\n`;
        // logArea.current
        //TODO: check the log set properly
        // setLog(() => log);
    });

    const logArea = useRef(null);

    //setup local logger
    let logger = logging.getLogger("App");

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
            logger.info((await device.open()).toString());
            await device.getDives(addDive);
        } catch (e) {
            logger.error((e as Error).toString());
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
                    ///https://mui.com/components/progress/
                    <LinearProgress variant="determinate" value={progress} sx={{ padding: 1, marginBottom: 2, marginTop: 2 }} />
                    <DivesGrid dives={dives} />
                    <TextField
                        id="log-area"
                        ref={logArea}
                        label="Log"
                        multiline
                        sx={{ minHeight: 300, width: 1, marginTop: 2 }}
                        maxRows={10}
                        value={log}
                    />
                    <Grid item xs={3}></Grid>
                </Grid>
            </Grid>
        </ThemeProvider >
    );
}

export default App;