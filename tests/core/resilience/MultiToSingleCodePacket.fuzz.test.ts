import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MultiToSingleCodePacket } from '../../../src/protocol/downlink/MultiToSingleCodePacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('MultiToSingleCodePacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // Fuzz the constructor directly
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.string(), // pin
        (configKey, pin) => {
          try {
            const packet = new MultiToSingleCodePacket({ configKey: configKey, pin: pin });

            // If it succeeds, the inputs MUST have matched strict validation:
            expect(configKey.length).toBe(8);
            expect(pin.length).toBe(6);
            expect(packet.opcode).toBe(0x0b); // MultiToSingleCodePacket opcode
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
          const packet = MultiToSingleCodePacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(MultiToSingleCodePacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
