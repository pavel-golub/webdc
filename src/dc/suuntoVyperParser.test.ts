import { SuuntoVyperParser } from './suuntoVyperParser';

test('Parse dive', () => {
    const diveData = new Uint8Array([0x09, 0x19, 0x00, 0x00, 0x1F, 0x1F, 0x80, 0x81, 0x7D, 0x1A, 0x7A, 0x26, 0x7B, 0x1D, 0x0A, 0x1A, 0x01, 0x14, 0x20, 0x2F, 0x00, 0x00, 0x00, 0x14, 0x10, 0x00, 0x05, 0x47]);
    //ts-ignore
    let parser = new SuuntoVyperParser(diveData, false);
    let dive = parser.getDive();

    expect(dive.date).toStrictEqual(new Date(2020, 1, 26, 10, 29));
    expect(dive.diveTime.toString()).toBe("40s");
    expect(dive.maxDepth).toBe(19.5072);
    expect(dive.waterTemperatureMinimum).toBe(31);
    expect(dive.airTemperature).toBe(32);
    expect(dive.samples.length).toBe(4);
    let sample = dive.samples[2];
    expect(sample.depth).toBe(19.5072);
    expect(sample.timeSeconds).toBe(60);
    expect(sample.isEventAscent).toBe(true);
    expect(sample.isEventCeiling).toBe(false);
});

test('Parse dive with final ascent', () => {
    const diveData = new Uint8Array([0x09, 0x20, 0x00, 0x00, 0x1D, 0x1C, 0x80, 0x7D, 0x7A, 0xFF, 0x00, 0xFE, 0x00, 0xFE, 0xFE, 0x01, 0x03, 0x01, 0xFA, 0xFA, 0xFD, 0xFF, 0xFF, 0xFE, 0x02, 0xFF, 0x01, 0x01, 0x01, 0x01, 0x00, 0xFC, 0x01, 0xFF, 0x51, 0x09, 0x20, 0x02, 0xFE, 0xFF, 0xFF, 0xFE, 0x00, 0x00, 0x02, 0xFE, 0xFF, 0x02, 0xFF, 0xFE, 0x01, 0xFE, 0x00, 0xFE, 0xFE, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x05, 0xFE, 0xFF, 0xFD, 0xFA, 0xD5, 0x09, 0x20, 0x00, 0x01, 0x00, 0x00, 0x01, 0xFE, 0xFF, 0x00, 0xFF, 0xFF, 0x00, 0x02, 0x00, 0x00, 0x02, 0x01, 0xFF, 0x00, 0xFE, 0xFE, 0xFE, 0x01, 0xFF, 0x02, 0x00, 0x03, 0xFF, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xD6, 0x09, 0x20, 0xFF, 0xFF, 0xFF, 0xFD, 0xFE, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xFE, 0xFF, 0xFE, 0x00, 0x00, 0x00, 0x01, 0x02, 0x01, 0x01, 0xFD, 0xFF, 0xFE, 0xFF, 0x00, 0xFF, 0x03, 0x01, 0x00, 0x01, 0x2A, 0x09, 0x20, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x03, 0xFE, 0x00, 0x02, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x02, 0x01, 0xFF, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x01, 0x04, 0x01, 0x02, 0x2F, 0x09, 0x1D, 0x00, 0x01, 0x02, 0x02, 0x01, 0xFF, 0x00, 0x00, 0x04, 0x03, 0x03, 0x03, 0x02, 0x04, 0x0E, 0x0E, 0x04, 0x05, 0x03, 0x14, 0x1E, 0x00, 0x00, 0x00, 0x00, 0x14, 0x01, 0x00, 0x00, 0xF7]);
    //ts-ignore
    let parser = new SuuntoVyperParser(diveData, false);
    let dive = parser.getDive();

    expect(dive.date).toStrictEqual(new Date(2020, 3, 5, 4, 14));
    expect(dive.diveTime.toString()).toBe("56m");
    expect(dive.maxDepth).toBe(19.2024);
    expect(dive.waterTemperatureMinimum).toBe(28);
    expect(dive.airTemperature).toBe(30);
    expect(dive.samples.length).toBe(56 * 3 + 2);
    let sample = dive.samples[dive.samples.length - 1];
    expect(sample.depth).toBe(0);
    expect(sample.timeSeconds).toBe(56 * 60 + 40);
    expect(sample.isEventAscent).toBe(true);
    expect(sample.isEventCeiling).toBe(false);
});

