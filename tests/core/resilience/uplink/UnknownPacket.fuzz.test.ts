import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { UnknownPacket } from '@/protocol/uplink/UnknownPacket';

describe('UnknownPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely handle arbitrary opcodes and arbitrary binary payloads', () => {
    // Fuzz the packet creation
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }), // opcodes 0-255
        fc.uint8Array({ minLength: 0, maxLength: 256 }), // payloads up to 256 bytes
        (opcode, payload) => {
          // UnknownPacket creation should never crash
          const packet = UnknownPacket.fromUnknownPayload(opcode, payload);
          expect(packet).toBeInstanceOf(UnknownPacket);

          // Verify properties
          expect(packet.opcode).toBe(opcode);
          expect(packet.payload).toEqual(payload);

          // Verify payload and toJSON output
          expect(packet.toPayload()).toEqual(payload);
          const json = packet.toJSON();
          expect(json).toEqual({
            opcode: opcode,
            payload: payload
          });
        }
      ),
      { numRuns: 1000 }
    );
  });

});
