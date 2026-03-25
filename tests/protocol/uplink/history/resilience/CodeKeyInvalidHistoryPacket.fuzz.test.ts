import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CodeKeyInvalidHistoryPacket } from '../../../../../src/protocol/uplink/history/CodeKeyInvalidHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';
import { buildMockRawPacket } from '../../../../../utils/packet-builder';

describe('CodeKeyInvalidHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = CodeKeyInvalidHistoryPacket.fromRaw(buildMockRawPacket(CodeKeyInvalidHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(CodeKeyInvalidHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
