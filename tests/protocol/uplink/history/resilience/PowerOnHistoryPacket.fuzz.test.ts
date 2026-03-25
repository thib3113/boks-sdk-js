import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { PowerOnHistoryPacket } from '../../../../../src/protocol/uplink/history/PowerOnHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('PowerOnHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = PowerOnHistoryPacket.fromRaw(buildMockRawPacket(PowerOnHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(PowerOnHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
