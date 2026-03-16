import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { GetLogsCountPacket } from '../../../src/protocol/downlink/GetLogsCountPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('GetLogsCountPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromPayload with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = GetLogsCountPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(GetLogsCountPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
