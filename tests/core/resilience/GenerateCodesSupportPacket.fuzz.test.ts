import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { GenerateCodesSupportPacket } from '../../../src/protocol/downlink/GenerateCodesSupportPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('GenerateCodesSupportPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // Fuzz the constructor directly
    fc.assert(
      fc.property(
        fc.oneof(fc.string(), fc.uint8Array({ minLength: 0, maxLength: 256 })), // seed
        (seed) => {
          try {
            const packet = new GenerateCodesSupportPacket(seed);

            // If it succeeds, the inputs MUST have matched strict validation:
            expect(packet.opcode).toBe(0x15); // GenerateCodesSupportPacket opcode
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

  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = GenerateCodesSupportPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(GenerateCodesSupportPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
