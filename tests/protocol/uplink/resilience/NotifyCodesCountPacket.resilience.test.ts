import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyCodesCountPacket } from '@/protocol/uplink/NotifyCodesCountPacket';
import { BoksOpcode } from '@/protocol/constants';
import { buildMockRawPacket } from '../../../../utils/packet-builder';

describe('NotifyCodesCountPacket - Resilience & Edge Cases', () => {
  describe('fromRaw()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 4 }), (payload) => {
          const packet = NotifyCodesCountPacket.fromRaw(buildMockRawPacket(NotifyCodesCountPacket.opcode, payload));
          expect(packet).toBeInstanceOf(NotifyCodesCountPacket);
          expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODES_COUNT);
          expect((packet as any).raw).toEqual(payload);

          const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
          expect(packet.masterCount).toBe(view.getUint16(0, false));
          expect(packet.otherCount).toBe(view.getUint16(2, false));
        })
      );
    });

    it('should throw an error for missing trailing bytes', () => {
      fc.assert(
        fc.property(fc.uint8Array({ maxLength: 3 }), (shortPayload) => {
          expect(() => NotifyCodesCountPacket.fromRaw(buildMockRawPacket(NotifyCodesCountPacket.opcode, shortPayload))).toThrowError();
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

            const packet = NotifyCodesCountPacket.fromRaw(buildMockRawPacket(NotifyCodesCountPacket.opcode, payload));
            expect(packet.masterCount).toBe(masterCount);
            expect(packet.otherCount).toBe(otherCount);
          }
        )
      );
    });
  });
});
