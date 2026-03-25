import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { AnswerDoorStatusPacket } from '@/protocol/uplink/AnswerDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';
import { buildMockRawPacket } from '../../../../utils/packet-builder';

describe('AnswerDoorStatusPacket - Resilience & Edge Cases', () => {
  describe('fromRaw()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array(), (payload) => {
          let packet;
          try {
            packet = AnswerDoorStatusPacket.fromRaw(buildMockRawPacket(AnswerDoorStatusPacket.opcode, payload));
          } catch (e: any) {
            expect(e.name).toBe('BoksProtocolError');
            return;
          }
          expect(packet).toBeInstanceOf(AnswerDoorStatusPacket);
          expect(packet.opcode).toBe(BoksOpcode.ANSWER_DOOR_STATUS);
          expect((packet as any).raw).toEqual(payload);

          // Boolean validation based on parsing logic
          if (payload.length >= 2) {
            const inverted = payload[0];
            const status = payload[1];
            if (status === 0x01 && inverted === 0x00) {
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
          const packet = AnswerDoorStatusPacket.fromRaw(buildMockRawPacket(AnswerDoorStatusPacket.opcode, payload));
          expect(packet.isOpen).toBe(true);
        })
      );
    });

    it('should throw BoksProtocolError if payload contains invalid booleans', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 }),
          (inverted, status) => {
            fc.pre((inverted !== 0x00 && inverted !== 0x01) || (status !== 0x00 && status !== 0x01)); // Exclude valid boolean bytes
            const payload = new Uint8Array([inverted, status]);
            expect(() => AnswerDoorStatusPacket.fromRaw(buildMockRawPacket(AnswerDoorStatusPacket.opcode, payload))).toThrowError(Error);
          }
        )
      );
    });
  });
});
