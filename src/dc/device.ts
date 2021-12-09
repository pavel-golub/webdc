import { concatenateArrays, getByteArrayAsString, sleep } from "./utils";
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
    private readonly _progressCallback: ProgressCallback = function (event: Progress) {
    };
    protected progress: ProgressHandler;

    constructor(port: SerialPort, progressCallback: ProgressCallback | null) {
        this._port = port;
        this.progress = new ProgressHandler(progressCallback != null ? progressCallback : function (event: Progress) {
        });
    }

    protected async sendCommand(command: Uint8Array, timeoutBeforeRTSReset: number) {
        console.debug("Set RTS");
        await this._port.setSignals({ requestToSend: true });
        console.debug("Send command: " + getByteArrayAsString(command));
        if (this._port.writable == null) {
            throw Error("Cannot write into port");
        }
        const writer = this._port.writable.getWriter();
        try {
            await writer.write(command);
        } finally {
            writer.close();
            writer.releaseLock();
        }
        await sleep(timeoutBeforeRTSReset);
        console.debug("Reset RTS");
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
                console.debug(`Finishing read by timeout ${this.readTimeoutMs} ms`);
                reader.cancel();
            }, this.readTimeoutMs)
        };

        console.debug("Start reading data");
        let data = new Uint8Array();
        //this timeout is not mandatory but allows to collect more bytes in one chunk
        await sleep(100);
        try {
            while (true) {
                let timer = startTimer();
                let { value, done } = await reader.read();
                //this timeout is not mandatory but allows to collect more bytes in one chunk
                await sleep(150);
                console.debug(`Read data: ${getByteArrayAsString(value)}, done: ${done}}`);
                clearTimeout(timer);
                if (value) {
                    data = concatenateArrays(Uint8Array, data, value) as Uint8Array;
                }
                const complete = shouldCompleteRead(data);
                if (done || complete) {
                    console.debug(`Finishing read by done: ${done}, shouldCompleteRead: ${complete}`);
                    break;
                }
            }
        } finally {
            //giving divece some time to prepare for next interaction
            await sleep(500);
            //flashing buffers
            reader.cancel();
            reader.releaseLock();
        }
        return data;
    }
}
