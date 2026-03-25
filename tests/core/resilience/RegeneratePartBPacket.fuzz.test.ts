import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { RegeneratePartBPacket } from '../../../src/protocol/downlink/RegeneratePartBPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('RegeneratePartBPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // Fuzz the constructor directly
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.uint8Array({ minLength: 0, maxLength: 256 }), // part
        (configKey, part) => {
          try {
            const packet = new RegeneratePartBPacket({ configKey: configKey, part: part });

            // If it succeeds, the inputs MUST have matched strict validation:
            expect(configKey.length).toBe(8);
            expect(part.length).toBe(16);
            expect(packet.opcode).toBe(0x21); // RegeneratePartBPacket opcode
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
          const packet = RegeneratePartBPacket.fromRaw(buildMockRawPacket(RegeneratePartBPacket.opcode, payload));
          expect(packet).toBeInstanceOf(RegeneratePartBPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
