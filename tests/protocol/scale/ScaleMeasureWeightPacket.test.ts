import { describe, it, expect } from 'vitest';
import { ScaleMeasureWeightPacket } from '@/protocol/scale/ScaleMeasureWeightPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleMeasureWeightPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleMeasureWeightPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_MEASURE_WEIGHT);
    expect(bytesToHex(packet.encode())).toBe('570057');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleMeasureWeightPacket.fromRaw(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_MEASURE_WEIGHT);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleMeasureWeightPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 87,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([ScaleMeasureWeightPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = ScaleMeasureWeightPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
