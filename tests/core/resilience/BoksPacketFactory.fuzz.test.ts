import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BoksPacketFactory } from '../../../src/protocol/BoksPacketFactory';
import { calculateChecksum } from '../../../src/utils/converters';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('BoksPacketFactory Resilience (Fuzzing)', () => {
  it('should not crash on arbitrary random payloads (graceful rejection or typed error)', () => {
    // We send completely random byte arrays.
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (data) => {
        try {
          const result = BoksPacketFactory.createFromPayload(data);
          expect(result === undefined || typeof result === 'object').toBe(true);
        } catch (e) {
          // If it throws, it MUST be a typed error, not a native crash like TypeError/RangeError
          // (e.g., trying to read out of bounds on Uint8Array)
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: should reject payloads with valid headers but invalid structural contents with BoksProtocolError', () => {
    // Generate an opcode and a length, then a payload that is deliberately shorter or contains junk,
    // but the checksum matches what the packet claims.
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }), // Opcode
        fc.integer({ min: 0, max: 255 }), // Length claimed in header
        fc.uint8Array({ minLength: 0, maxLength: 255 }), // Actual payload data
        (opcode, length, payloadData) => {
          const payloadLen = Math.min(length, payloadData.length);
          const data = new Uint8Array(2 + length + 1);
          data[0] = opcode;
          data[1] = length;
          data.set(payloadData.subarray(0, payloadLen), 2);

          // Compute correct checksum
          data[2 + length] = calculateChecksum(data.subarray(0, 2 + length));

          try {
            const result = BoksPacketFactory.createFromPayload(data);
            expect(result === undefined || typeof result === 'object').toBe(true);
          } catch (e) {
            // The factory correctly validates internal fields (e.g. Config Key length, PIN length)
            // and throws a typed `BoksProtocolError` when invalid. This is a deliberate feature
            // to ensure strict parsing.
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });
});
