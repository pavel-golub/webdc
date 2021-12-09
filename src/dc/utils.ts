export function checksum_xor_uint8(data: [] | Uint8Array, offset: number, size: number, init: number) {
    let crc = init;
    for (let i = offset; i < offset + size; ++i) {
        crc ^= data[i];
    }

    return crc;
}

export function concatenateArrays(resultConstructor: new (arg0: number) => any, ...arrays: any[]): any[] | Uint8Array {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new resultConstructor(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getByteArrayAsString(bytes: Uint8Array | undefined) {
    if (!bytes) {
        return "[]";
    }
    let data1 = new Array<number>();

    for (let x = 0; x < bytes.byteLength; x++) {
        data1.push(bytes[x]);
    }
    //@ts-ignore
    return `[${data1.map(x => "0x" + (x <= 0xF ? "0" : "") + x.toString(16).toUpperCase()).join(", ")}]`;
}

export class Units {
    static POUND = 0.45359237
    static FEET = 0.3048
    static INCH = 0.0254
    static GRAVITY = 9.80665
    static ATM = 101325.0
    static BAR = 100000.0
    static FSW = (this.ATM / 33.0)
    static MSW = (this.BAR / 10.0)
    static PSI = ((this.POUND * this.GRAVITY) / (this.INCH * this.INCH))
    static CUFT = (this.FEET * this.FEET * this.FEET)
}