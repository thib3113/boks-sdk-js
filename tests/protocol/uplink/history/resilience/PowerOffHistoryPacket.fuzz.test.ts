import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { PowerOffHistoryPacket } from '../../../../../src/protocol/uplink/history/PowerOffHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';
import { buildMockRawPacket } from '../../../../../utils/packet-builder';

describe('PowerOffHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = PowerOffHistoryPacket.fromRaw(buildMockRawPacket(PowerOffHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(PowerOffHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
