import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { GenerateCodesPacket } from '../../../src/protocol/downlink/GenerateCodesPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('GenerateCodesPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // Fuzz the constructor directly
    fc.assert(
      fc.property(
        fc.oneof(fc.string(), fc.uint8Array({ minLength: 0, maxLength: 256 })), // seed
        (seed) => {
          try {
            const packet = new GenerateCodesPacket(seed);

            // If it succeeds, the inputs MUST have matched strict validation:
            expect(packet.opcode).toBe(0x06); // GenerateCodesPacket opcode
          } catch (e) {
            // It is an intended FEATURE that validation throws a BoksProtocolError.
            // It should NEVER crash with TypeError, RangeError, etc.
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromPayload with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = GenerateCodesPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(GenerateCodesPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
