import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { RegeneratePartAPacket } from '../../../src/protocol/downlink/RegeneratePartAPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('RegeneratePartAPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // Fuzz the constructor directly
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.uint8Array({ minLength: 0, maxLength: 256 }), // part
        (configKey, part) => {
          try {
            const packet = new RegeneratePartAPacket({ configKey: configKey, part: part });

            // If it succeeds, the inputs MUST have matched strict validation:
            expect(configKey.length).toBe(8);
            expect(part.length).toBe(16);
            expect(packet.opcode).toBe(0x20); // RegeneratePartAPacket opcode
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
          const packet = RegeneratePartAPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(RegeneratePartAPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
