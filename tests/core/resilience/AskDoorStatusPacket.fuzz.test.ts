import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { AskDoorStatusPacket } from '../../../src/protocol/downlink/AskDoorStatusPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('AskDoorStatusPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = AskDoorStatusPacket.fromRaw(buildMockRawPacket(AskDoorStatusPacket.opcode, payload));
          expect(packet).toBeInstanceOf(AskDoorStatusPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
