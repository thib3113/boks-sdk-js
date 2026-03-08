import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyNfcTagFoundPacket } from '@/protocol/uplink/NotifyNfcTagFoundPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyNfcTagFoundPacket - Resilience & Edge Cases', () => {
  describe('fromPayload()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array(), (payload) => {
          const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(NotifyNfcTagFoundPacket);
          expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_FOUND);
          expect((packet as any).rawPayload).toEqual(payload);
          expect(packet.status).toBe('found');

          // UID should simply be the hex representation of the entire payload
          expect(packet.uid).toBe(bytesToHex(payload));
        })
      );
    });

    it('should correctly handle completely empty payloads', () => {
      const packet = NotifyNfcTagFoundPacket.fromPayload(new Uint8Array(0));
      expect(packet.uid).toBe('');
    });

    it('should parse specific known lengths correctly', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 4, maxLength: 10 }), (payload) => {
          const packet = NotifyNfcTagFoundPacket.fromPayload(payload);
          expect(packet.uid.length).toBe(payload.length * 2);
        })
      );
    });
  });
});
