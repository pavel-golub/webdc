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
        return "";
    }
    // @ts-ignore
    return `[${Array.apply([], bytes)/*.map(x => x.toString(16))*/.join(",")}]`;
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