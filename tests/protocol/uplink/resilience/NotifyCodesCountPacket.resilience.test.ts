import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyCodesCountPacket } from '@/protocol/uplink/NotifyCodesCountPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyCodesCountPacket - Resilience & Edge Cases', () => {
  describe('fromPayload()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array(), (payload) => {
          const packet = NotifyCodesCountPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(NotifyCodesCountPacket);
          expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODES_COUNT);
          expect((packet as any).rawPayload).toEqual(payload);

          if (payload.length >= 4) {
            const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
            expect(packet.masterCount).toBe(view.getUint16(0, false));
            expect(packet.otherCount).toBe(view.getUint16(2, false));
          } else {
            expect(packet.masterCount).toBe(0);
            expect(packet.otherCount).toBe(0);
          }
        })
      );
    });

    it('should handle missing trailing bytes cleanly (defaults to 0)', () => {
      fc.assert(
        fc.property(fc.uint8Array({ maxLength: 3 }), (shortPayload) => {
          const packet = NotifyCodesCountPacket.fromPayload(shortPayload);
          expect(packet.masterCount).toBe(0);
          expect(packet.otherCount).toBe(0);
        })
      );
    });

    it('should correctly parse the counts with trailing bytes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 65535 }),
          fc.integer({ min: 0, max: 65535 }),
          fc.uint8Array(),
          (masterCount, otherCount, trailingBytes) => {
            const buffer = new ArrayBuffer(4 + trailingBytes.length);
            const view = new DataView(buffer);
            view.setUint16(0, masterCount, false);
            view.setUint16(2, otherCount, false);

            const payload = new Uint8Array(buffer);
            payload.set(trailingBytes, 4);

            const packet = NotifyCodesCountPacket.fromPayload(payload);
            expect(packet.masterCount).toBe(masterCount);
            expect(packet.otherCount).toBe(otherCount);
          }
        )
      );
    });
  });
});
