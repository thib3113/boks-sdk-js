import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { EndHistoryPacket } from '@/protocol/uplink/EndHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('EndHistoryPacket - Resilience & Edge Cases', () => {
  describe('fromRaw()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array(), (payload) => {
          const packet = EndHistoryPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(EndHistoryPacket);
          expect(packet.opcode).toBe(BoksOpcode.LOG_END_HISTORY);
          expect((packet as any).raw).toEqual(payload);
        })
      );
    });

    it('should instantiate cleanly with empty payload', () => {
      const payload = new Uint8Array(0);
      const packet = EndHistoryPacket.fromRaw(payload);
      expect(packet.opcode).toBe(BoksOpcode.LOG_END_HISTORY);
    });
  });

  describe('constructor()', () => {
    it('should handle undefined payload safely', () => {
      const packet = new EndHistoryPacket();
      expect(packet).toBeInstanceOf(EndHistoryPacket);
      expect(packet.opcode).toBe(BoksOpcode.LOG_END_HISTORY);
      expect((packet as any).raw).toEqual(new Uint8Array(0));
    });
  });
});
