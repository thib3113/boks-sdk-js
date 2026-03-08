import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { OpenDoorPacket } from '../../../src/protocol/downlink/OpenDoorPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('OpenDoorPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromPayload with BoksProtocolError', () => {
    // Fuzzing the specific packet parser payload logic
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          try {
            const packet = OpenDoorPacket.fromPayload(payload);
            expect(packet).toBeInstanceOf(OpenDoorPacket);
          } catch (e) {
            // Must gracefully reject with BoksProtocolError when the PIN inside the payload
            // is less than 6 bytes, or contains invalid ascii characters outside (0-9, A, B).
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });
});
