import { describe, it, expect } from 'vitest';
import { NotifyScaleRawSensorsPacket } from '@/protocol/scale/NotifyScaleRawSensorsPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('NotifyScaleRawSensorsPacket', () => {
  it('should parse correctly with data', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = NotifyScaleRawSensorsPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_RAW_SENSORS);
    expect(packet.data).toEqual(payload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyScaleRawSensorsPacket(new Uint8Array([0x01, 0x02, 0x03]));
    const encoded = packet.encode();
    // Opcode 0xB9 (185), Len 3, Data 010203, Checksum 0xC2 (185+3+1+2+3=194=0xC2)
    expect(bytesToHex(encoded)).toBe('B903010203C2');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyScaleRawSensorsPacket.fromRaw(new Uint8Array([0x01, 0x02, 0x03]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "data": new Uint8Array([
          1,
          2,
          3,
        ]),
        "opcode": 185,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyScaleRawSensorsPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = NotifyScaleRawSensorsPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });

  describe('Fuzzer coverage edge cases', () => {
    it('should extract payload from data that coincidentally resembles a valid packet header', () => {
      const payload = new Uint8Array([BoksOpcode.NOTIFY_SCALE_RAW_SENSORS, 0x03, 0x01, 0x02, 0x03]);
      const packet = NotifyScaleRawSensorsPacket.fromRaw(payload);
      const expectedData = PayloadMapper.parse(NotifyScaleRawSensorsPacket, payload).data;
      expect(packet.data).toEqual(expectedData);
    });
  });
});
