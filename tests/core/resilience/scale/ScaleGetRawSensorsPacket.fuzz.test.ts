import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ScaleGetRawSensorsPacket } from '../../../../src/protocol/scale/ScaleGetRawSensorsPacket';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';
import { BoksOpcode } from '../../../../src/protocol/constants';

describe('ScaleGetRawSensorsPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = ScaleGetRawSensorsPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(ScaleGetRawSensorsPacket);
          expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_RAW_SENSORS);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
