import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyMacAddressBoksScalePacket } from '../../../../src/protocol/scale/NotifyMacAddressBoksScalePacket';
import { BoksOpcode } from '../../../../src/protocol/constants';

describe('NotifyMacAddressBoksScalePacket Resilience (Fuzzing)', () => {
  it('should not crash on arbitrary random payloads', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (data) => {
        const packet = NotifyMacAddressBoksScalePacket.fromPayload(data);
        expect(packet).toBeInstanceOf(NotifyMacAddressBoksScalePacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_MAC_ADDRESS_BOKS_SCALE);
        expect(typeof packet.macAddress).toBe('string');
      }),
      { numRuns: 1000 }
    );
  });
});
