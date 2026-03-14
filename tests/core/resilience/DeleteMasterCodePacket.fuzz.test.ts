import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DeleteMasterCodePacket } from '../../../src/protocol/downlink/DeleteMasterCodePacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('DeleteMasterCodePacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject invalid constructor arguments with BoksProtocolError', () => {
    // We fuzz the constructor directly with strings/numbers of various lengths and contents.
    fc.assert(
      fc.property(
        fc.string(), // configKey
        fc.integer(), // index
        (configKey, index) => {
          try {
            const packet = new DeleteMasterCodePacket({ configKey: configKey, index: index });

            // If it succeeds, the inputs MUST have matched the strict validation criteria:
            // Config Key = 8 hex chars, index = 0..255
            expect(configKey.length).toBe(8);
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThanOrEqual(255);
            expect(packet.opcode).toBe(0x0F); // DeleteMasterCodePacket opcode
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
            const packet = DeleteMasterCodePacket.fromPayload(payload);
            expect(packet).toBeInstanceOf(DeleteMasterCodePacket);
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
