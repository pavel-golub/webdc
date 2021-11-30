import Box from '@mui/material/Box';
import React, {useRef, useState} from 'react';
// import logo from './logo.svg';
// import './App.css';
import {PortSelector} from "./PortSelector";
import {Container, LinearProgress, Stack, TextField, ThemeProvider} from "@mui/material";
import {createTheme} from '@mui/material/styles';
import {logging} from "./log/LogManager";
import {Progress} from "./dc/progress";
import {SuuntoVyperDevice} from "./dc/suuntoVyperDevice";
import {DataGrid} from '@mui/x-data-grid';
import {DivesGrid} from "./DivesGrid";
import {Dive} from "./dc/diveProfile";

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
    let [log, setLog] = useState("");
    const [progress, setProgress] = useState(0);
    const [dives, setDives] = useState<Array<Dive>>(new Array<Dive>(0));
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
        setProgress(event.total == 0 ? 0 : (event.current / event.total) * 100);
    }

    //setup
    let getDivesCallback = async function (port: SerialPort) {
        let device = new SuuntoVyperDevice(port, updateProgress);
        try {
            logger.info((await device.open()).toString());
            //TODO: use emitter or a callback?
            let dives1 = await device.getDives();
            logger.info(dives1.toString());
            setDives(dives1);
        } catch (e: unknown) {
            logger.error((e as Error).toString());
        } finally {
            await device.close()
        }
    }

    // @ts-ignore
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                <Box sx={{height: 200}}/>
                <PortSelector getDivesCallback={getDivesCallback}/>
                <LinearProgress variant="determinate" value={progress}/>
                <DivesGrid dives={dives}/>
                <TextField
                    id="log-area"
                    ref={logArea}
                    label="Log"
                    multiline
                    sx={{minHeight: 300}}
                    maxRows={10}
                    value={log}
                />
            </Box>
        </ThemeProvider>
    );
}

export default App;
