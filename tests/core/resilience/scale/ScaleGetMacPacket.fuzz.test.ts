import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ScaleGetMacPacket } from '../../../../src/protocol/scale/ScaleGetMacPacket';
import { BoksOpcode } from '../../../../src/protocol/constants';

describe('ScaleGetMacPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should safely parse completely arbitrary payloads without crashing', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleGetMacPacket.fromRaw(buildMockRawPacket(ScaleGetMacPacket.opcode, payload));
        expect(packet).toBeInstanceOf(ScaleGetMacPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS);
        expect(packet.toPayload().length).toBe(0);
      }),
      { numRuns: 1000 }
    );
  });
});
