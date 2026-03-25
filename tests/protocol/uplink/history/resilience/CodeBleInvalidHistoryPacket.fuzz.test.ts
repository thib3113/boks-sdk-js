import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CodeBleInvalidHistoryPacket } from '../../../../../src/protocol/uplink/history/CodeBleInvalidHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('CodeBleInvalidHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = CodeBleInvalidHistoryPacket.fromRaw(buildMockRawPacket(CodeBleInvalidHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(CodeBleInvalidHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
