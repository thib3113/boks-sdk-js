import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ScaleTareLoadedPacket } from '../../../../src/protocol/scale/ScaleTareLoadedPacket';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';
import { BoksOpcode } from '../../../../src/protocol/constants';

describe('ScaleTareLoadedPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = ScaleTareLoadedPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(ScaleTareLoadedPacket);
          expect(packet.opcode).toBe(BoksOpcode.SCALE_TARE_LOADED);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
