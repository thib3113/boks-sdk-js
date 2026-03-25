import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { HistoryEraseHistoryPacket } from '../../../../../src/protocol/uplink/history/HistoryEraseHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('HistoryEraseHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = HistoryEraseHistoryPacket.fromRaw(buildMockRawPacket(HistoryEraseHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(HistoryEraseHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
