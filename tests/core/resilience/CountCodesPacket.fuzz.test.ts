import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CountCodesPacket } from '../../../src/protocol/downlink/CountCodesPacket';

describe('CountCodesPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely handle malformed binary payloads in fromPayload', () => {
    // We fuzz the fromPayload binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        // CountCodesPacket ignores payload, so it should always succeed
        const packet = CountCodesPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(CountCodesPacket);
        expect(packet.opcode).toBe(0x14); // CountCodesPacket opcode
      }),
      { numRuns: 1000 }
    );
  });
});
