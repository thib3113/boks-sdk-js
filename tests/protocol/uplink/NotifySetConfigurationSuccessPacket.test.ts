import { describe, it, expect } from 'vitest';
import { NotifySetConfigurationSuccessPacket } from '@/protocol/uplink/NotifySetConfigurationSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifySetConfigurationSuccessPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifySetConfigurationSuccessPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SET_CONFIGURATION_SUCCESS);
  });
});
