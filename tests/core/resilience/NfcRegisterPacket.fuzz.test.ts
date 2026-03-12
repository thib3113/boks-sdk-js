import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NfcRegisterPacket } from '../../../src/protocol/downlink/NfcRegisterPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('NfcRegisterPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // We fuzz the constructor directly with strings/numbers of various lengths and contents.
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.string(), // uid
        (configKey, uid) => {
          try {
            const packet = new NfcRegisterPacket({ configKey: configKey, uid: uid });

            // If it succeeds, the inputs MUST have matched the strict validation criteria:
            // Config Key = 8 hex chars
            expect(configKey.length).toBe(8);
            expect(packet.opcode).toBe(0x13); // NfcRegisterPacket opcode
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
            const packet = NfcRegisterPacket.fromPayload(payload);
            expect(packet).toBeInstanceOf(NfcRegisterPacket);
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
