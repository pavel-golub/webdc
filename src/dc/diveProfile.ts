const Duration = require("duration-js");

export class GasMix {
    oxygen = 0.0;
    helium = 0.0;
    nitrogen = 0.0;
}

export class Sample {
    timeSeconds = 0;
    depth = 0.0;
    isEventAscent = false;
    isEventViolation = false;
    isEventBookmark = false;
    isEventSurface = false;
    isEventDecoStop = false;
    isEventCeiling = false;
    isEventSafetyStop = false;

    toString() {
        return new Duration(this.timeSeconds + "s").toString() + ": " + this.depth;
    }
}

export class Tank {
    type: string = "none";
    volume = 0;
    workPressure = 0;
    beginPressure = 0;
    endPressure = 0;
    gasmix: GasMix = new GasMix();
}

export enum DiveMode {
    Gauge,
    OpenCircuit
}

export class Dive {
    diveTime = new Duration();
    date: Date = new Date();
    airTemperature: number = 0;
    //TODO: move into Tanks
    gasMixes = new Array<GasMix>();
    tanks = new Array<Tank>();
    samples = new Array<Sample>();
    maxDepth: number = 0;
    isGauge: Boolean = false;
    diveMode: DiveMode = DiveMode.OpenCircuit;
    waterTemperatureMinimum: number = 0;
}
