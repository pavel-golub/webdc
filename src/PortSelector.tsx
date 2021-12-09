import React, {ReactNode} from "react";
import Button from '@mui/material/Button';
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent} from "@mui/material";

type PortSelectorProps = {
    // port: SerialPort | undefined;
    getDivesCallback: (port: SerialPort) => Promise<void>
}

export class PortSelector extends React.Component<PortSelectorProps> {
    state = {
        opsItem: "Initializing",
        devices: new Array<SerialPortInfo>(0),
        selected: "",
        ports: new Array<SerialPort>(),
        log: ""
    }

    constructor(props: PortSelectorProps) {
        super(props);
        // this.getDivesOrSelectPort = this.getDivesOrSelectPort.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    async componentDidMount() {
        if ("serial" in navigator) {
            const ports = await navigator.serial.getPorts();
            let devices = new Array<SerialPortInfo>(ports.length);
            for (let i = 0; i < ports.length; i++) {
                devices[i] = ports[i].getInfo();
            }
            if (ports.length === 0) {
                this.setState({opsItem: "AddDevice", selected: "AddDevice"});
            } else {
                this.setState({opsItem: "AddDevice", devices: devices, ports: ports, selected: "0"});
            }
        } else {
            this.setState({opsItem: "NotSupported"});
        }
    }

    private async getDivesOrSelectPort(that: PortSelector) {
        if (that.state.selected === "") {
            that.state.selected = that.state.opsItem;
        }
        if (that.state.selected === "NotSupported" || that.state.selected === "Initializing") {
            return;
        }
        if (that.state.selected === "AddDevice") {
            // Prompt user to select any serial port.
            let port: SerialPort | undefined;
            try {
                port = await navigator.serial.requestPort();
            } catch (e) {
                console.info(e);
            }
            if (port) {
                await this.props.getDivesCallback(port);
            }
        } else {
            await this.props.getDivesCallback(that.state.ports[(that.state.selected as unknown as number)]);
        }
    }

    private handleChange(e: SelectChangeEvent<string>, value: ReactNode) {
        this.setState({selected: e.target.value});
    }

    render() {
        return (
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: "center", justifyContent: "center"}}>
                <FormControl variant="standard" sx={{m: 1, minWidth: 150}}>
                    <InputLabel id="demo-simple-select-label2">Model</InputLabel>
                    <Select label="Model" labelId="demo-simple-select-label2" value="Suunto:Vyper"
                            name="model" id="model-select">
                        <MenuItem value="Suunto:Vyper">Suunto Vyper</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="standard" sx={{m: 1, minWidth: 150}}>
                    <InputLabel id="demo-simple-select-label">Device</InputLabel>

                    <Select label="Device" labelId="demo-simple-select-label" onChange={this.handleChange}
                            value={this.state.selected}
                            name="ports" id="port-select">
                        <MenuItem
                            value={this.state.opsItem}><em>{this.state.opsItem === "NotSupported" ? "Browser doesn't support serial interface" : "Add device"}</em></MenuItem>

                        {this.state.devices.map(function (d, idx) {
                            //TO-DO display real device name e.g. by using WebUsb interface and mapping by vendor and product id
                            // @ts-ignore
                            return (<MenuItem key={idx} value={idx}>{d.usbVendorId}: {d.usbProductId}</MenuItem>)
                        })}
                    </Select>
                </FormControl>
                <FormControl sx={{alignContent: 'bottom'}}>
                    <Button variant="contained" onClick={async () => this.getDivesOrSelectPort(this)}>Get
                        Dives</Button>
                </FormControl>
            </Box>
        );
    }
}