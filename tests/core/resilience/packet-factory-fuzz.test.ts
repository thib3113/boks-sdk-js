import { describe, it } from 'vitest';
import fc from 'fast-check';
import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { calculateChecksum } from '@/utils/converters';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

describe('BoksPacketFactory Resilience & Fuzzing', () => {
  it('should not throw native JS exceptions (e.g., TypeError, RangeError) on any random payload', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }), // random opcode
        fc.uint8Array({ minLength: 0, maxLength: 512 }), // random payload length & content
        (opcode, payload) => {
          // Construct a structually valid Boks packet (correct opcode, length, and checksum)
          // to bypass the factory's top-level checks and force the specific Packet classes
          // to parse the malformed payload in their `fromPayload` methods.
          const data = new Uint8Array(payload.length + 3);
          data[0] = opcode;
          data[1] = payload.length; // Actually, if length > 255, it will wrap around but that's fine for fuzzing
          data.set(payload, 2);
          data[data.length - 1] = calculateChecksum(data.subarray(0, payload.length + 2));

          try {
            BoksPacketFactory.createFromPayload(data);
          } catch (e) {
            // Protocol errors (like invalid PIN format, wrong length expected) are handled and expected
            // in the context of IoT. But native JS exceptions mean the SDK has a bug that could crash
            // the runtime environment when receiving garbage bytes over BLE.
            if (!(e instanceof BoksProtocolError)) {
              throw e;
            }
          }
        }
      ),
      { numRuns: 10000 }
    );
  });
});
