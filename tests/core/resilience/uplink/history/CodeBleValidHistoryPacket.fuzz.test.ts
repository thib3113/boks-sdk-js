import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { CodeBleValidHistoryPacket } from '../../../../../src/protocol/uplink/history/CodeBleValidHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';

describe('CodeBleValidHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: CodeBleValidHistoryPacket should safely handle arbitrary payload lengths without native errors', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = CodeBleValidHistoryPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(CodeBleValidHistoryPacket);
          expect(packet.opcode).toBe(CodeBleValidHistoryPacket.opcode);
        } catch (e: any) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
