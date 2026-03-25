import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CodeKeyValidHistoryPacket } from '../../../../../src/protocol/uplink/history/CodeKeyValidHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('CodeKeyValidHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = CodeKeyValidHistoryPacket.fromRaw(buildMockRawPacket(CodeKeyValidHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(CodeKeyValidHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
