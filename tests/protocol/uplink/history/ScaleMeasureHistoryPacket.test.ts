import { describe, it, expect } from 'vitest';
import { ScaleMeasureHistoryPacket } from '@/protocol/uplink/history/ScaleMeasureHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ScaleMeasureHistoryPacket', () => {
  it('should parse correctly with age and data', () => {
    // 0x01, 0x02, 0x03, 0x04 -> Data
    const payload = new Uint8Array([0x00, 0x00, 0x0A, 0x01, 0x02, 0x03, 0x04]);
    const packet = ScaleMeasureHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_SCALE_MEASURE);
    expect(packet.age).toBe(10);
    expect(packet.data).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
  });

  it('should handle missing data', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0A]);
    const packet = ScaleMeasureHistoryPacket.fromPayload(payload);
    expect(packet.data.length).toBe(0);
  });


  describe('ScaleMeasureHistoryPacket default construction', () => {
    it('should handle constructor with default age', () => {
      const packet = new ScaleMeasureHistoryPacket();
      expect(packet.age).toBe(0);
    });
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
    it('should extract age 0 if payload is less than 3 bytes', () => {
      const payload = new Uint8Array([0, 0]); // Length 2
      const packet = ScaleMeasureHistoryPacket.fromPayload(payload);
      expect(packet.age).toBe(0);
    });
  });
});
