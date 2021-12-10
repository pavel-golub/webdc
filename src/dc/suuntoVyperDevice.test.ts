import { SuuntoVyperDevice } from './suuntoVyperDevice';

export class SerialPort {
}

test('Stop reading dive data when returned less than packet size bytes', () => {
    const dive1 = new Uint8Array([0x08, 0x20, 0x00, 0x00, 0x1C, 0x1C, 0x80, 0x7D, 0xFC, 0x00, 0xFF, 0x00, 0x02, 0x00, 0x00, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFD, 0xFF, 0xFF, 0x01, 0x00, 0xFF, 0x01, 0x00, 0x00, 0x01, 0xFF, 0x01, 0x03, 0xD5, 0x08, 0x20, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0xFE, 0x00, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x01, 0xFF, 0xFF, 0xFF, 0xFE, 0xFD, 0xFF, 0xFE, 0xFE, 0x00, 0xFF, 0x01, 0xFF, 0xD7, 0x08, 0x20, 0xFF, 0x01, 0xFE, 0xFF, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFC, 0x00, 0x00, 0x00, 0x03, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x01, 0x01, 0xFD, 0x02, 0x02, 0xFE, 0xFC, 0x00, 0x01, 0x02, 0x00, 0xD4, 0x08, 0x20, 0xFF, 0x00, 0x02, 0x00, 0xFF, 0x00, 0x00, 0x02, 0xFE, 0xFE, 0x00, 0xFE, 0xFD, 0xFE, 0xFE, 0xFF, 0x02, 0x01, 0x01, 0x01, 0x01, 0x02, 0x00, 0xFD, 0x01, 0xFF, 0x00, 0xFE, 0x00, 0x00, 0x00, 0x01, 0x28, 0x08, 0x20, 0xFF, 0xFE, 0xFF, 0xFE, 0xFD, 0xFF, 0xFD, 0x00, 0x00, 0x00, 0x03, 0xFF, 0x01, 0xFF, 0x00, 0x00, 0xFF, 0x00, 0x01, 0x03, 0x00, 0x01, 0x00, 0x03, 0x02, 0xFF, 0x00, 0xFF, 0xFF, 0xFD, 0xFF, 0xFF, 0x2A, 0x08, 0x20, 0x01, 0x00, 0x00, 0x05, 0xFE, 0xFE, 0xFF, 0xFF, 0xFD, 0x00, 0xFF, 0x00, 0x00, 0x01, 0x04, 0xFF, 0x00, 0x02, 0x03, 0x05, 0x03, 0x04, 0x06, 0x05, 0x07, 0x03, 0x03, 0x04, 0x0D, 0x01, 0x06, 0x05, 0xD8, 0x08, 0x0B, 0x03, 0x14, 0x1D, 0x22, 0x00, 0x00, 0x00, 0x14, 0x02, 0x00, 0x32, 0x0F]);
    //@ts-ignore
    let device = new SuuntoVyperDevice(new SerialPort(), null);
    expect(device["isLastPacket"](dive1)).toBe(true);
});


test('Cant stop reading dive which has multiple packets of exactly 32 bytes', () => {
    const dive2 = new Uint8Array([0x09, 0x20, 0x00, 0x00, 0x17, 0x17, 0x80, 0x7D, 0xFE, 0xFF, 0x00, 0x00, 0xFF, 0x00, 0x00, 0xFF, 0x01, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0xFE, 0x01, 0xFE, 0xFF, 0x00, 0x00, 0x00, 0x01, 0xFF, 0x03, 0x00, 0xFF, 0x28, 0x09, 0x20, 0x00, 0xFD, 0xFF, 0x05, 0xFD, 0xFF, 0x02, 0x00, 0x00, 0xFE, 0xFF, 0x00, 0x01, 0xFE, 0x00, 0xFE, 0xFE, 0x00, 0x01, 0x00, 0x01, 0xFD, 0x00, 0x01, 0xFE, 0x00, 0x01, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0xD3, 0x09, 0x20, 0x00, 0x00, 0xFF, 0x01, 0xFF, 0x01, 0xFF, 0x02, 0x00, 0xFF, 0x01, 0x02, 0x01, 0xFF, 0x01, 0x01, 0x00, 0xFE, 0x00, 0x00, 0x01, 0xFE, 0x01, 0x03, 0xFE, 0xFE, 0x00, 0x01, 0x01, 0xFE, 0x00, 0x02, 0x29, 0x09, 0x20, 0x01, 0xFD, 0x01, 0x00, 0x01, 0x01, 0xFE, 0x01, 0xFF, 0x03, 0xFE, 0x00, 0xFF, 0x01, 0x00, 0x01, 0xFF, 0xFF, 0x01, 0x01, 0xFE, 0xFE, 0x02, 0x00, 0xFE, 0x01, 0x01, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xD5, 0x09, 0x20, 0xFF, 0x00, 0x01, 0xFF, 0x00, 0x00, 0x01, 0x02, 0xFE, 0x00, 0xFF, 0x00, 0xFF, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x01, 0x01, 0xFD, 0x00, 0xFF, 0x01, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0xD6, 0x09, 0x20, 0xFF, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xFF, 0xFF, 0x03, 0x01, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xD5, 0x09, 0x20, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0xFF, 0x00, 0x00, 0x01, 0xFF, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x02, 0x00, 0x01, 0xFF, 0x01, 0x00, 0x01, 0x00, 0xD7, 0x09, 0x20, 0x00, 0x01, 0x01, 0x01, 0x00, 0x01, 0x00, 0x01, 0xFF, 0x01, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x05, 0x0F, 0x0E, 0x07, 0x02, 0x08, 0x0C, 0x17, 0x1B, 0x00, 0x00, 0x00, 0x14, 0x02, 0x00, 0x06, 0xCF]);
    //@ts-ignore
    let device = new SuuntoVyperDevice(new SerialPort(), null);
    expect(device["isLastPacket"](dive2)).toBe(false);
});
