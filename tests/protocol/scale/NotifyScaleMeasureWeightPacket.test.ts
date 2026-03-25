import { describe, it, expect } from 'vitest';
import { NotifyScaleMeasureWeightPacket } from '@/protocol/scale/NotifyScaleMeasureWeightPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('NotifyScaleMeasureWeightPacket', () => {
  it('should parse positive weight', () => {
    // 0x00 Sign + Value 0x0003E8 (1000)
    const payload = new Uint8Array([0x00, 0x00, 0x03, 0xe8]);
    const packet = NotifyScaleMeasureWeightPacket.fromRaw(buildMockRawPacket(NotifyScaleMeasureWeightPacket.opcode, payload));
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_MEASURE_WEIGHT);
    expect(packet.weight).toBe(1000);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyScaleMeasureWeightPacket(1000);
    const encoded = packet.encode();
    // Opcode 0xB7 (183), Len 4, sign 0, val 0003E8, Checksum 0xA6
    // Sum: 183 + 4 + 0 + 0 + 3 + 232 = 422, 422 % 256 = 166 (0xA6)
    expect(bytesToHex(encoded)).toBe('B704000003E8A6');
  });

  it('should parse negative weight', () => {
    // 0x01 Sign + Value 0x0003E8 (1000) -> -1000
    const payload = new Uint8Array([0x01, 0x00, 0x03, 0xe8]);
    const packet = NotifyScaleMeasureWeightPacket.fromRaw(buildMockRawPacket(NotifyScaleMeasureWeightPacket.opcode, payload));
    expect(packet.weight).toBe(-1000);
  });

  it('should throw error on short payload', () => {
    const payload = new Uint8Array(2);
    expect(() => NotifyScaleMeasureWeightPacket.fromRaw(buildMockRawPacket(NotifyScaleMeasureWeightPacket.opcode, payload))).toThrowError();
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyScaleMeasureWeightPacket.fromRaw(buildMockRawPacket(NotifyScaleMeasureWeightPacket.opcode, new Uint8Array([0x00, 0x00, 0x03, 0xe8])));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "absWeight": 1000,
        "opcode": 183,
        "signNegative": false,
      });
  });
});
