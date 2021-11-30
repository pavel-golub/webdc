import {concatenateArrays, getByteArrayAsString, sleep} from "./utils";
import {Logger} from "../log/Logger";
import {logging} from "../log/LogManager";
import {Progress, ProgressHandler} from "./progress";

export class DeviceInfo {
    model = ""
    firmware = ""
    serial = ""
}

export type ProgressCallback = (event: Progress) => any;

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

    async sendCommand(command: Uint8Array, timeoutBeforeRTSReset: number) {
        this._logger.debug("Set RTS");
        await this._port.setSignals({requestToSend: true});
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
        await this._port.setSignals({requestToSend: false});
    }

    private readonly readTimeoutMs = 10000;

    async readData(): Promise<Uint8Array> {
        if (!this._port.readable) {
            throw Error("Cannot read data");
        }
        const reader = this._port.readable.getReader();

        let couldCancel = true;
        let startTimer = () => {
            return setTimeout(() => {
                this._logger.debug(`Finishing read by timeout ${this.readTimeoutMs} ms`);
                reader.cancel();
            }, this.readTimeoutMs)
        };

        this._logger.debug("Start reading data");
        let data = new Uint8Array();
        /*
                const process = async (
                    result: ReadableStreamReadResult<Uint8Array>
                ): Promise<ReadableStreamReadResult<Uint8Array>> => {
                    subscriber.next(result.value);
                    return !result.done || !port.readable
                        ? reader.read().then(process)
                        : Promise.resolve(result);
                };


                    reader.read().then(process);
                }*/

        try {
            while (true) {
                let timer = startTimer();
                const {value, done} = await reader.read();
                this._logger.debug(`Read data: ${getByteArrayAsString(value)}, done: ${done}`)
                clearTimeout(timer);
                if (value) {
                    data = concatenateArrays(Uint8Array, data, value) as Uint8Array;
                }
                if (done) {
                    break;
                }
            }
        } finally {
            reader.releaseLock();
        }
        return data;
    }
}
