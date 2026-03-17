import { describe, it, expect } from 'vitest';
import { ScaleMeasureHistoryPacket } from '@/protocol/uplink/history/ScaleMeasureHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { bytesToHex } from '@/utils/converters';

describe('ScaleMeasureHistoryPacket', () => {
  it('should parse correctly with age and data', () => {
    // 0x01, 0x02, 0x03, 0x04 -> Data
    const payload = new Uint8Array([0x00, 0x00, 0x0a, 0x01, 0x02, 0x03, 0x04]);
    const packet = ScaleMeasureHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_SCALE_MEASURE);
    expect(packet.age).toBe(10);
    expect(packet.data).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new ScaleMeasureHistoryPacket({
      age: 10,
      data: new Uint8Array([0x01, 0x02, 0x03, 0x04])
    });
    const encoded = packet.encode();
    // Opcode 0x98 (152), Len 7, Age 10 (00000A), Data 01020304, Checksum 0xB0
    // Sum: 152 + 7 + 0 + 0 + 10 + 1 + 2 + 3 + 4 = 176 (0xB0)
    expect(bytesToHex(encoded)).toBe('980700000A01020304B3');
  });

  it('should handle missing data', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0a]);
    const packet = ScaleMeasureHistoryPacket.fromPayload(payload);
    expect(packet.data.length).toBe(0);
  });

  describe('ScaleMeasureHistoryPacket short payload data block', () => {
    it('should extract empty data if payload is 3 bytes', () => {
      const payload = new Uint8Array([0, 0, 3]); // Length 3
      const packet = ScaleMeasureHistoryPacket.fromPayload(payload);
      expect(packet.data).toEqual(new Uint8Array(0));
    });

    it('should extract data if payload is > 3 bytes', () => {
      const payload = new Uint8Array([0, 0, 3, 4, 5]); // Length 5
      const packet = ScaleMeasureHistoryPacket.fromPayload(payload);
      expect(packet.data).toEqual(new Uint8Array([4, 5]));
    });
  });

  describe('ScaleMeasureHistoryPacket very short payload edge case', () => {
    it('should throw BoksProtocolError if payload is less than 3 bytes', () => {
      const payload = new Uint8Array([0, 0]); // Length 2
      expect(() => ScaleMeasureHistoryPacket.fromPayload(payload)).toThrow(BoksProtocolError);
    });
  });
});
