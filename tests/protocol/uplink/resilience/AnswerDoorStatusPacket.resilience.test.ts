import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { AnswerDoorStatusPacket } from '@/protocol/uplink/AnswerDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('AnswerDoorStatusPacket - Resilience & Edge Cases', () => {
  describe('fromPayload()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array(), (payload) => {
          let packet;
        // TODO, crashing with invalid data is normal, but we need to check the error, no catch without tests . Need to rewrite this test
        try {
             packet = AnswerDoorStatusPacket.fromPayload(payload);
          } catch(e) { return; }
          expect(packet).toBeInstanceOf(AnswerDoorStatusPacket);
          expect(packet.opcode).toBe(BoksOpcode.ANSWER_DOOR_STATUS);
          expect((packet as any).rawPayload).toEqual(payload);

          // Boolean validation based on parsing logic
          if (payload.length >= 2) {
            const inverted = payload[0];
            const raw = payload[1];
            if (raw === 0x01 && inverted === 0x00) {
              expect(packet.isOpen).toBe(true);
            } else {
              expect(packet.isOpen).toBe(false);
            }
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
          const packet = AnswerDoorStatusPacket.fromPayload(payload);
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
            expect(() => AnswerDoorStatusPacket.fromPayload(payload)).toThrowError(Error);
          }
        )
      );
    });
  });
});
