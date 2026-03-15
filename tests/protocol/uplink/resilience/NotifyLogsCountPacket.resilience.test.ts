import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyLogsCountPacket } from '@/protocol/uplink/NotifyLogsCountPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyLogsCountPacket - Resilience & Edge Cases', () => {
  describe('fromPayload()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 2 }), (payload) => {
          const packet = NotifyLogsCountPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(NotifyLogsCountPacket);
          expect(packet.opcode).toBe(BoksOpcode.NOTIFY_LOGS_COUNT);
          expect((packet as any).rawPayload).toEqual(payload);

          if (payload.length >= 2) {
            const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
            expect(packet.count).toBe(view.getUint16(0, false));
          } else {
            expect(packet.count).toBe(0);
          }
        })
      );
    });

    it('should throw MALFORMED_DATA on short payload', () => {
      fc.assert(
        fc.property(fc.uint8Array({ maxLength: 1 }), (shortPayload) => {
          expect(() => NotifyLogsCountPacket.fromPayload(shortPayload)).toThrowError(Error);
        })
      );
    });

    it('should correctly parse the count with trailing bytes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 65535 }),
          fc.uint8Array(),
          (count, trailingBytes) => {
            const buffer = new ArrayBuffer(2 + trailingBytes.length);
            const view = new DataView(buffer);
            view.setUint16(0, count, false);

            const payload = new Uint8Array(buffer);
            payload.set(trailingBytes, 2);

            const packet = NotifyLogsCountPacket.fromPayload(payload);
            expect(packet.count).toBe(count);
          }
        )
      );
    });
  });
});
