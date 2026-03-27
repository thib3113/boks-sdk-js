import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { UnknownPacket } from '../../../../src/protocol/uplink/UnknownPacket';

describe('UnknownPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject fromRaw constructor calls to prevent un-opcoded creation', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 512 }), (payload) => {
        try {
          UnknownPacket.fromRaw(payload);
          expect.unreachable('Should have thrown an Error on fromRaw');
        } catch (e: any) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe('Use fromUnknownPayload instead');
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: should safely accept arbitrary opcode numbers and payloads', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }), // opcodes
        fc.uint8Array({ minLength: 0, maxLength: 512 }), // random payload
        (opcode, payload) => {
          const packet = UnknownPacket.fromUnknownPayload(opcode, payload);
          expect(packet).toBeInstanceOf(UnknownPacket);
          expect(packet.opcode).toBe(opcode);
          expect(packet.payload).toBe(payload);
          expect(packet.toPayload()).toBe(payload);

          const json = packet.toJSON();
          expect(json.opcode).toBe(opcode);
          expect(json.payload).toBe(payload);
          expect(json).toHaveProperty('validChecksum');
        }
      ),
      { numRuns: 1000 }
    );
  });
});
