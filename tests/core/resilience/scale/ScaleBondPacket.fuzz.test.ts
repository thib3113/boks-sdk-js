import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ScaleBondPacket } from '../../../../src/protocol/scale/ScaleBondPacket';
import { BoksOpcode } from '../../../../src/protocol/constants';
import { BoksPacket } from '../../../../src/protocol/_BoksPacketBase';

describe('ScaleBondPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should safely parse completely arbitrary payloads without crashing', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleBondPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ScaleBondPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_BOND);
        const expectedData = BoksPacket.extractPayloadData(payload, BoksOpcode.SCALE_BOND);
        expect(packet.data).toEqual(expectedData);
      }),
      { numRuns: 1000 }
    );
  });
});
