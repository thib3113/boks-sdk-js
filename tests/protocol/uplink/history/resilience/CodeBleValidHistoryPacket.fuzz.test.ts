import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CodeBleValidHistoryPacket } from '../../../../../src/protocol/uplink/history/CodeBleValidHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';
import { buildMockRawPacket } from '../../../../../utils/packet-builder';

describe('CodeBleValidHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = CodeBleValidHistoryPacket.fromRaw(buildMockRawPacket(CodeBleValidHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(CodeBleValidHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
