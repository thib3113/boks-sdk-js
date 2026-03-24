import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BlockResetHistoryPacket } from '../../../../../src/protocol/uplink/history/BlockResetHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('BlockResetHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = BlockResetHistoryPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(BlockResetHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
