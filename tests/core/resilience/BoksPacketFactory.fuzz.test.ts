import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BoksPacketFactory } from '../../../src/protocol/BoksPacketFactory';
import { calculateChecksum } from '../../../src/utils/converters';

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
          expect((e as Error).name).toBe('BoksProtocolError');
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('BUG REGRESSION: should gracefully handle packets with valid headers and checksums but malformed/truncated payloads', () => {
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

          // The safe state is that the factory catches parsing issues
          // and either returns undefined (ignored packet) or an ErrorPacket.
          // It should NOT throw an unhandled exception that bubbles up to the caller
          // (which could crash the BLE notification listener).
          expect(() => {
            BoksPacketFactory.createFromPayload(data);
          }).not.toThrow();
        }
      ),
      { numRuns: 1000 }
    );
  });
});
