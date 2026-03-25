import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { RequestLogsPacket } from '../../../src/protocol/downlink/RequestLogsPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('RequestLogsPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = RequestLogsPacket.fromRaw(buildMockRawPacket(RequestLogsPacket.opcode, payload));
          expect(packet).toBeInstanceOf(RequestLogsPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
