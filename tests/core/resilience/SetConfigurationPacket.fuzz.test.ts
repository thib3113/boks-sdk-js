import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { SetConfigurationPacket } from '../../../src/protocol/downlink/SetConfigurationPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('SetConfigurationPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // Fuzz the constructor directly
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.integer(), // configType
        fc.boolean(), // value
        (configKey, configType, value) => {
          try {
            const packet = new SetConfigurationPacket(configKey, configType, value);

            // If it succeeds, the inputs MUST have matched strict validation:
            // Config Key = 8 hex chars
            expect(configKey.length).toBe(8);
            expect(packet.opcode).toBe(0x19); // SetConfigurationPacket opcode
          } catch (e) {
            // It is an intended FEATURE that validation throws a BoksProtocolError.
            // It should NEVER crash with TypeError, RangeError, etc.
            if (!(e instanceof BoksProtocolError)) {
              throw e;
            }
          }
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromPayload with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          try {
            const packet = SetConfigurationPacket.fromPayload(payload);
            expect(packet).toBeInstanceOf(SetConfigurationPacket);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });
});
