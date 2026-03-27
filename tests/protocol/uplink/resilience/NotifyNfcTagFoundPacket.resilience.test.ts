import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyNfcTagFoundPacket } from '@/protocol/uplink/NotifyNfcTagFoundPacket';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

describe('NotifyNfcTagFoundPacket - Resilience & Edge Cases', () => {
  describe('fromRaw()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array(), (payload) => {
          try {
            const packet = NotifyNfcTagFoundPacket.fromRaw(payload);
            const uidLength = payload[0];
            expect(packet.uid.length / 2).toBe(uidLength);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        })
      );
    });

    it('should correctly handle completely empty payloads', () => {
      expect(() => NotifyNfcTagFoundPacket.fromRaw(new Uint8Array(0))).toThrow(
        BoksProtocolError
      );
    });

    it('should parse specific known lengths correctly', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 4, maxLength: 10 }), (payload) => {
          try {
            const packet = NotifyNfcTagFoundPacket.fromRaw(payload);
            const uidLength = payload[0];
            expect(packet.uid.length / 2).toBe(uidLength);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        })
      );
    });
  });
});
