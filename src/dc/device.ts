import { concatenateArrays, getByteArrayAsString, sleep } from "./utils";
import { Logger } from "../log/Logger";
import { logging } from "../log/LogManager";
import { Progress, ProgressHandler } from "./progress";
import { Dive } from "./diveProfile";

export class DeviceInfo {
    model = ""
    firmware = ""
    serial = ""
}

export type ProgressCallback = (event: Progress) => any;

export type DiveCallback = (dive: Dive) => any;

export type shouldCompleteRead = (data: Uint8Array) => boolean;

export class Device {
    protected _port: SerialPort;
    private _logger: Logger;
    private readonly _progressCallback: ProgressCallback = function (event: Progress) {
    };
    protected progress: ProgressHandler;

    constructor(port: SerialPort, progressCallback: ProgressCallback | null) {
        this._port = port;
        this.progress = new ProgressHandler(progressCallback != null ? progressCallback : function (event: Progress) {
        });
        this._logger = logging.getLogger('Device');
    }

    protected async sendCommand(command: Uint8Array, timeoutBeforeRTSReset: number) {
        this._logger.debug("Set RTS");
        await this._port.setSignals({ requestToSend: true });
        this._logger.debug("Send command: " + getByteArrayAsString(command));
        if (this._port.writable == null) {
            throw Error("Cannot write into port");
        }
        const writer = this._port.writable.getWriter();
        try {
            await writer.write(command);
        } finally {
            writer.releaseLock();
        }
        await sleep(timeoutBeforeRTSReset);
        this._logger.debug("Reset RTS");
        await this._port.setSignals({ requestToSend: false });
    }

    private readonly readTimeoutMs = 1000;

    protected async readData(shouldCompleteRead: shouldCompleteRead | undefined): Promise<Uint8Array> {
        if (!shouldCompleteRead) {
            shouldCompleteRead = () => false;
        }
        if (!this._port.readable) {
            throw Error("Cannot read data");
        }
        const reader = this._port.readable.getReader();

        let startTimer = () => {
            return setTimeout(() => {
                this._logger.debug(`Finishing read by timeout ${this.readTimeoutMs} ms`);
                reader.cancel();
            }, this.readTimeoutMs)
        };

        this._logger.debug("Start reading data");
        let data = new Uint8Array();
        await sleep(100);
        try {
            while (true) {
                let timer = startTimer();
                let { value, done } = await reader.read();
                await sleep(150);
                this._logger.debug(`Read data: ${getByteArrayAsString(value)}, done: ${done}}`);
                clearTimeout(timer);
                if (value) {
                    data = concatenateArrays(Uint8Array, data, value) as Uint8Array;
                }
                const complete = shouldCompleteRead(data);
                if (done || complete) {
                    this._logger.debug(`Finishing read by done: ${done}, shouldCompleteRead: ${complete}`);
                    break;
                }
            }
        } finally {
            reader.releaseLock();
        }
        return data;
    }
}
