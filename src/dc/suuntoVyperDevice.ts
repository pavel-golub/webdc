import { Device, DeviceInfo, DiveCallback, ProgressCallback } from "./device";
import { checksum_xor_uint8, sleep } from "./utils";
import { SuuntoVyperConsts } from "./suuntoVyperConsts";
import { Dive } from "./diveProfile";
import { SuuntoVyperParser } from "./suuntoVyperParser";

export class SuuntoVyperDevice extends Device {
    private rtsSleepMs = 200;

    constructor(port: SerialPort | null, progressCallback: ProgressCallback | null) {
        super(port == null ? new SerialPort() : port, progressCallback);
    }

    async open(): Promise<DeviceInfo> {
        await this._port.open({ baudRate: 2400, dataBits: 8, parity: "odd", stopBits: 1, flowControl: "none" });
        await sleep(1000);
        console.debug("Set DTR");
        await this._port.setSignals({ dataTerminalReady: true });
        await sleep(600);
        return await this.getDeviceInfo();
    }

    async close() {
        console.debug("Close serial port");
        await this._port.close();
    }

    async getDives(diveCallback: DiveCallback) {
        let isFirst = true;
        while (true) {
            let dive = await this.getDive(isFirst);
            isFirst = false;
            if (dive === null) {
                break;
            }
            diveCallback(dive);
        }
    }

    private async getDive(isFirst: boolean): Promise<Dive | null> {
        let command = new Uint8Array([isFirst ? 0x08 : 0x09, 0xA5, 0x00]);
        command[2] = checksum_xor_uint8(command, 0, 2, 0x00);
        await this.sendCommand(command, this.rtsSleepMs);
        let data = await this.readData(this.isLastPacket);
        let len = data[1];
        if (data.length === 0 || len === 0) {
            return null;
        }
        // -1 for CRC byte
        this.progress.updateDeltaProgress(data.length - 1);
        let parser = new SuuntoVyperParser(data, isFirst);
        return parser.getDive();
    }

    private isLastPacket(data: Uint8Array): boolean {
        let offset = 0;
        while (offset < data.byteLength) {
            let len = data[offset + 1];
            if (len === 0) {
                return true;
            }
            // not sure this logic is correct but presumably if device returned less data than standard packet size then it means that it is the last packet
            // if for some reason there are issues becuase of this if then feel free to remove it because it is just optimization
            if (len < SuuntoVyperConsts.SZ_PACKET && offset + len + 3 === data.byteLength) {
                return true;
            }
            offset += len + 3;
        }
        return false;
    }

    private async getDeviceInfo() {
        await this.sendCommand(new Uint8Array([0x05, 0x00, 0x16, 0x14, 0x07]), this.rtsSleepMs);
        var header = await this.readData((data: Uint8Array) => (data.byteLength >= (SuuntoVyperConsts.HDR_DEVINFO_END - SuuntoVyperConsts.HDR_DEVINFO_BEGIN)));
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
