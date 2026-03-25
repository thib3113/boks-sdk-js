import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { RegisterNfcTagScanStartPacket } from '../../../src/protocol/downlink/RegisterNfcTagScanStartPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('RegisterNfcTagScanStartPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // We fuzz the constructor directly with strings/numbers of various lengths and contents.
    fc.assert(
      fc.property(
        fc.string(), // configKey
        (configKey) => {
          try {
            const packet = new RegisterNfcTagScanStartPacket(configKey);

            // If it succeeds, the inputs MUST have matched the strict validation criteria:
            // Config Key = 8 hex chars
            expect(configKey.length).toBe(8);
            expect(packet.opcode).toBe(0x17); // RegisterNfcTagScanStartPacket opcode
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
          const packet = RegisterNfcTagScanStartPacket.fromRaw(buildMockRawPacket(RegisterNfcTagScanStartPacket.opcode, payload));
          expect(packet).toBeInstanceOf(RegisterNfcTagScanStartPacket);
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
