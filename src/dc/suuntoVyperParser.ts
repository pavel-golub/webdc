import {checksum_xor_uint8, concatenateArrays, Units} from './utils'
import {Dive, DiveMode, GasMix, Sample, Tank} from './diveProfile'
import {SuuntoVyperConsts} from "./suuntoVyperConsts";
import {logging} from "../log/LogManager";
import {Logger} from "../log/Logger";

const Duration = require("duration-js");

export class SuuntoVyperParser {
    private source;
    private marker: number = 0;
    private isMostRecentDive: boolean;
    private logger: Logger;

    constructor(source: Uint8Array, isMostRecentDive: boolean) {
        this.source = source;
        this.isMostRecentDive = isMostRecentDive;
        this.logger = logging.getLogger('SuuntoVyperParser');
    }

    validate() {
        let answer = this.source;
        let offset = 0;
        // let totalLength = 0;
        while (offset < answer.length) {
            // totalLength += answer[offset + 1];
            if (answer[offset] !== (this.isMostRecentDive ? 0x08 : 0x09) ||
                answer[offset + 1] > SuuntoVyperConsts.SZ_PACKET) {
                throw Error("Unexpected answer start byte(s)");
            }
            // Verify the checksum of the package.
            let len = answer[offset + 1];
            let crc = answer[offset + len + 2];
            let ccrc = checksum_xor_uint8(answer, offset, len + 2, 0x00);

            if (crc !== ccrc) {
                throw Error("Unexpected answer checksum");
            }

            if (len === 0) {
                break;
            }
            offset += len + 3;
        }
    }

    putSamples(result: Dive, data: Uint8Array) {
        let ngasmixes = 1;
        let oxygen = [SuuntoVyperConsts.NGASMIXES];
        if (data[6] !== 0)
            oxygen[0] = data[6];
        else
            oxygen[0] = 21;

        // Parse the samples.
        let interval = data[3];
        let nsamples = 0;
        let depth = 0, maxDepth = 0;
        let offset = 14;
        let time = 0;
        let size = data.length;
        let complete = true;
        let sample = new Sample();
        result.samples.push(new Sample());
        while (offset < size && data[offset] !== 0x80) {
            sample = new Sample();
            let value = data[offset++];
//TODO: validate this logic is valid, it increases time for markers
            if (complete) {
                // Time (seconds).
                time += interval;
                sample.timeSeconds = time;
                complete = false;
            }

            if (value < 0x79 || value > 0x87) {
                // Delta depth.
                let signedChar = value <= 127 ? value : (value - 256)
                depth += signedChar;
                sample.depth = depth * Units.FEET;
                if (depth > maxDepth)
                    maxDepth = depth;
                nsamples++;
                complete = true;
            } else {
                switch (value) {
                    case 0x7a: // Slow
                        sample.isEventAscent = true;
                        break;
                    case 0x7b: // Violation
                        sample.isEventViolation = true;
                        break;
                    case 0x7c: // Bookmark
                        sample.isEventBookmark = true;
                        break;
                    case 0x7d: // Surface
                        sample.isEventSurface = true;
                        break;
                    case 0x7e: // Deco
                        sample.isEventDecoStop = true;
                        break;
                    case 0x7f: // Ceiling (Deco Violation)
                        sample.isEventCeiling = true;
                        break;
                    case 0x81: // Safety Stop
                        sample.isEventSafetyStop = true;
                        break;
                    case 0x87: // Gas Change
                        // Gas change event.
                        if (offset + 1 > size) {
                            throw Error("Invalid dive data format");
                        }

                        // Get the new gas mix.
                        let o2 = data[offset++];

                        // Find the gasmix in the list.
                        let i = 0;
                        while (i < ngasmixes) {
                            if (o2 === oxygen[i])
                                break;
                            i++;
                        }

                        // Add it to list if not found.
                        if (i >= ngasmixes) {
                            if (i >= SuuntoVyperConsts.NGASMIXES) {
                                throw Error("Maximum number of gas mixes reached.");
                            }
                            oxygen[i] = o2;
                            ngasmixes = i + 1;
                        }
                        break;
                    default: // Unknown
                        this.logger.warn("Unknown event");
                        break;
                }
            }
            result.samples.push(sample);
        }

        if (complete) {
            time += interval;
            sample.timeSeconds = time;
        }
        sample.depth = 0;

        // Check the end marker.
        this.marker = offset;
        if (this.marker + 4 >= size || data[this.marker] !== 0x80) {
            throw Error("No valid end marker found!");
        }
        result.diveTime = new Duration(nsamples * interval + "s");
        result.maxDepth = maxDepth * Units.FEET;
        if (!result.isGauge) {
            for (let i = 0; i < ngasmixes; i++) {
                const gasMix = new GasMix();
                gasMix.helium = 0.0;
                gasMix.oxygen = oxygen[i] / 100.0;
                gasMix.nitrogen = 1.0 - gasMix.oxygen - gasMix.helium;
                result.gasMixes.push(gasMix);
            }
        }
    }

    getDive() {
        this.validate();
        var result = new Dive();
        //remove header and checksum info
        let answer = this.source;
        let offset = 0;
        let data = new Uint8Array();
        while (offset < answer.length) {
            let len = answer[offset + 1];
            data = concatenateArrays(Uint8Array, data, answer.subarray(offset + 2, offset + 2 + len)) as Uint8Array;
            offset += len + 3;
        }
        data.reverse();
        result.airTemperature = data[8];
        result.date = new Date(data[9] + (data[9] < 90 ? 2000 : 1900), data[10], data[11], data[12], data[13]);
        result.isGauge = (data[4] & 0x40) === 0;

        let tank = new Tank();
        tank.type = "none";
        tank.volume = 0.0;
        tank.workPressure = 0.0;
        tank.beginPressure = data[5] * 2;
        this.putSamples(result, data);
        //initialize rest after marker is calculated
        tank.endPressure = data[this.marker + 3] * 2;
        // tank.gasmix = result.isGauge ? "unknown" : "TODO:known";
        result.tanks = (tank.beginPressure === 0 && tank.endPressure === 0) ? [] : [tank];
        result.waterTemperatureMinimum = data[this.marker + 1];
        result.diveMode = result.isGauge ? DiveMode.Gauge : DiveMode.OpenCircuit;
        return result;
    }

}