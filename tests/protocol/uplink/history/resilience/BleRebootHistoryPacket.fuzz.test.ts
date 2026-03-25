import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BleRebootHistoryPacket } from '../../../../../src/protocol/uplink/history/BleRebootHistoryPacket';
import { BoksProtocolError } from '../../../../../src/errors/BoksProtocolError';
import { buildMockRawPacket } from '../../../../../utils/packet-builder';

describe('BleRebootHistoryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = BleRebootHistoryPacket.fromRaw(buildMockRawPacket(BleRebootHistoryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(BleRebootHistoryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
