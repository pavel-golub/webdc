import {ProgressCallback} from "./device";
import {logging} from "../log/LogManager";
import {Logger} from "../log/Logger";

export class Progress {
    current = 0;
    total = 0;
}

export class ProgressHandler {
    private readonly _progressCallback: ProgressCallback;
    private progress = new Progress();
    private logger: Logger;

    constructor(progressCallback: ProgressCallback) {
        this._progressCallback = progressCallback;
        this.logger = logging.getLogger('ProgressHandler');
    }

    setTotalProgress(total: number) {
        this.progress.total = total;
        this._progressCallback(this.progress);
    }

    updateProgress(current: number) {
        this.progress.current = current;
        this._progressCallback(this.progress);
    }

    updateDeltaProgress(delta: number) {
        this.progress.current += delta;
        if (this.progress.current > this.progress.total) {
            this.logger.debug(`Warning! Current progress (${this.progress.current}) exceeds total (${this.progress.total})`);
            this.progress.current = this.progress.total;
        }
        this._progressCallback(this.progress);
    }
}