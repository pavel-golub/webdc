import {Device, DeviceInfo, ProgressCallback} from "./device";
import {checksum_xor_uint8, sleep} from "./utils";
import {SuuntoVyperConsts} from "./suuntoVyperConsts";
import {Dive} from "./diveProfile";
import {SuuntoVyperParser} from "./suuntoVyperParser";
import {Logger} from "../log/Logger";
import {logging} from "../log/LogManager";

export class SuuntoVyperDevice extends Device {
    private rtsSleepMs = 200;
    private logger: Logger;

    constructor(port: SerialPort, progressCallback: ProgressCallback | null) {
        super(port, progressCallback);
        this.logger = logging.getLogger('SuuntoVyperDevice');
    }

    async open(): Promise<DeviceInfo> {
        await this._port.open({baudRate: 2400, dataBits: 8, parity: "odd", stopBits: 1, flowControl: "none"});
        await sleep(1000);
        this.logger.debug("Set DTR");
        await this._port.setSignals({dataTerminalReady: true});
        await sleep(600);
        return await this.getDeviceInfo();
    }

    async close() {
        this.logger.debug("Close serial port");
        await this._port.close();
    }

    async getDives(): Promise<Array<Dive>> {
        let result = new Array<Dive>();
        let isFirst = true;
        while (true) {
            let dive = await this.getDive(isFirst);
            isFirst = false;
            if (dive == null) {
                break;
            }
            result.push(dive);
        }
        return result;
    }

    async getDive(isFirst: boolean): Promise<Dive | null> {
        let command = new Uint8Array([isFirst ? 0x08 : 0x09, 0xA5, 0x00]);
        command[2] = checksum_xor_uint8(command, 0, 2, 0x00);
        await this.sendCommand(command, this.rtsSleepMs);
        let data = await this.readData();
        if (data.length === 0) {
            return null;
        }
        this.progress.updateDeltaProgress(data.length);
        let parser = new SuuntoVyperParser(data, true);
        return parser.getDive();
    }

    private async getDeviceInfo() {
        await this.sendCommand(new Uint8Array([0x05, 0x00, 0x16, 0x14, 0x07]), this.rtsSleepMs);
        var header = await this.readData();
        if (header.length === 0) {
            throw Error("Cannot read device info");
        }

        // Identify the connected device as a Vyper or a Spyder, by inspecting
        // the Vyper model code. For a Spyder, this value will contain the
        // sample interval (20, 30 or 60s) instead of the model code.
        var hoffset = SuuntoVyperConsts.HDR_DEVINFO_VYPER - SuuntoVyperConsts.HDR_DEVINFO_BEGIN;
        if (header[hoffset] === 20 || header[hoffset] === 30 || header[hoffset] === 60) {
            hoffset = SuuntoVyperConsts.HDR_DEVINFO_SPYDER - SuuntoVyperConsts.HDR_DEVINFO_BEGIN;
            // layout = & suunto_spyder_layout;
        }

        this.progress.setTotalProgress(header.length + SuuntoVyperConsts.suunto_vyper_layout.rb_profile_end - SuuntoVyperConsts.suunto_vyper_layout.rb_profile_begin);
        this.progress.updateProgress(header.length);

        const deviceInfo = new DeviceInfo();
        deviceInfo.model = header[hoffset].toString();
        deviceInfo.firmware = header[hoffset + 1].toString();
        let serial = 0;
        for (let i = 0; i < 4; ++i) {
            serial *= 100;
            serial += header[hoffset + 2 + i];
        }
        deviceInfo.serial = serial.toString();
        return deviceInfo;
    }
}