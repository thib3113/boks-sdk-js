import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MasterCodeEditPacket } from '../../../src/protocol/downlink/MasterCodeEditPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('MasterCodeEditPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // Fuzz the constructor directly
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.integer(), // index
        fc.string(), // newPin
        (configKey, index, newPin) => {
          try {
            const packet = new MasterCodeEditPacket({
              configKey: configKey,
              index: index,
              newPin: newPin
            });

            // If it succeeds, the inputs MUST have matched strict validation:
            // Config Key = 8 hex chars, PIN = 6 authorized chars, Index = 0..255
            expect(configKey.length).toBe(8);
            expect(newPin.length).toBe(6);
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThanOrEqual(255);
            expect(packet.opcode).toBe(0x09); // MasterCodeEditPacket opcode
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
          const packet = MasterCodeEditPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(MasterCodeEditPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
