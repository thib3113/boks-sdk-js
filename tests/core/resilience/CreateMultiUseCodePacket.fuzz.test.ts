import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CreateMultiUseCodePacket } from '../../../src/protocol/downlink/CreateMultiUseCodePacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('CreateMultiUseCodePacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // We fuzz the constructor directly with strings/numbers of various lengths and contents.
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.string(), // pin
        (configKey, pin) => {
          try {
            const packet = new CreateMultiUseCodePacket({ configKey: configKey, pin: pin });

            // If it succeeds, the inputs MUST have matched the strict validation criteria:
            // Config Key = 8 hex chars, PIN = 6 authorized chars
            expect(configKey.length).toBe(8);
            expect(pin.length).toBe(6);
            expect(packet.opcode).toBe(0x05); // CreateMultiUseCodePacket opcode
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
    // We fuzz the fromPayload binary parser
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          try {
            const packet = CreateMultiUseCodePacket.fromPayload(payload);
            expect(packet).toBeInstanceOf(CreateMultiUseCodePacket);
          } catch (e) {
            // It is an intended FEATURE that fromPayload validation throws a BoksProtocolError
            // when extracting out-of-bounds or malformed string bytes.
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });
});
