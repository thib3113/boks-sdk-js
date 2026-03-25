import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CreateSingleUseCodePacket } from '../../../src/protocol/downlink/CreateSingleUseCodePacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('CreateSingleUseCodePacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // We fuzz the constructor directly with strings/numbers of various lengths and contents.
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.string(), // pin
        (configKey, pin) => {
          try {
            const packet = new CreateSingleUseCodePacket({ configKey: configKey, pin: pin });

            // If it succeeds, the inputs MUST have matched the strict validation criteria:
            // Config Key = 8 hex chars, PIN = 6 authorized chars
            expect(configKey.length).toBe(8);
            expect(pin.length).toBe(6);
            expect(packet.opcode).toBe(0x12); // CreateSingleUseCodePacket opcode
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
    // We fuzz the fromRaw binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = CreateSingleUseCodePacket.fromRaw(buildMockRawPacket(CreateSingleUseCodePacket.opcode, payload));
          expect(packet).toBeInstanceOf(CreateSingleUseCodePacket);
        } catch (e) {
          // It is an intended FEATURE that fromRaw validation throws a BoksProtocolError
          // when extracting out-of-bounds or malformed string bytes.
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
