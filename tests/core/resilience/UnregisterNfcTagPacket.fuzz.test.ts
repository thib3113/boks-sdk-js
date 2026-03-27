import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { UnregisterNfcTagPacket } from '../../../src/protocol/downlink/UnregisterNfcTagPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('UnregisterNfcTagPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // Fuzz the constructor directly
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.string(), // uid
        (configKey, uid) => {
          try {
            const packet = new UnregisterNfcTagPacket({ configKey: configKey, uid: uid });

            // If it succeeds, the inputs MUST have matched strict validation:
            // Config Key = 8 hex chars
            expect(configKey.length).toBe(8);
            expect(packet.opcode).toBe(0x19); // UnregisterNfcTagPacket opcode
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
          const packet = UnregisterNfcTagPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(UnregisterNfcTagPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
