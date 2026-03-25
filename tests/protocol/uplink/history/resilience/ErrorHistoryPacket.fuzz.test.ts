import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ErrorHistoryPacket } from '../../../../../src/protocol/uplink/history/ErrorHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('ErrorHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = ErrorHistoryPacket.fromRaw(buildMockRawPacket(ErrorHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(ErrorHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
