import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyDoorStatusPacket } from '@/protocol/uplink/NotifyDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyDoorStatusPacket - Resilience & Edge Cases', () => {
  describe('fromPayload()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 2 }), (payload) => {
          let packet;
          try {
            packet = NotifyDoorStatusPacket.fromPayload(payload);
          } catch (e: any) {
            expect(e.name).toBe('BoksProtocolError');
            return;
          }
          expect(packet).toBeInstanceOf(NotifyDoorStatusPacket);
          expect(packet.opcode).toBe(BoksOpcode.NOTIFY_DOOR_STATUS);
          expect((packet as any).rawPayload).toEqual(payload);

          // Boolean validation based on parsing logic
          const inverted = payload[0];
          const raw = payload[1];
          if (raw === 0x01 && inverted === 0x00) {
            expect(packet.isOpen).toBe(true);
          } else {
            expect(packet.isOpen).toBe(false);
          }
        })
      );
    });

    it('should correctly handle the exact valid OPEN sequence regardless of trailing bytes', () => {
      fc.assert(
        fc.property(fc.uint8Array(), (trailingBytes) => {
          const payload = new Uint8Array([0x00, 0x01, ...trailingBytes]);
          const packet = NotifyDoorStatusPacket.fromPayload(payload);
          expect(packet.isOpen).toBe(true);
        })
      );
    });

    it('should throw BoksProtocolError if payload contains invalid booleans', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 }),
          (inverted, raw) => {
            fc.pre((inverted !== 0x00 && inverted !== 0x01) || (raw !== 0x00 && raw !== 0x01)); // Exclude valid boolean bytes
            const payload = new Uint8Array([inverted, raw]);
            expect(() => NotifyDoorStatusPacket.fromPayload(payload)).toThrowError(Error);
          }
        )
      );
    });
  });
});
