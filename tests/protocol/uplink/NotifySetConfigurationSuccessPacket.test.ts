import { describe, it, expect } from 'vitest';
import { NotifySetConfigurationSuccessPacket } from '@/protocol/uplink/NotifySetConfigurationSuccessPacket';

describe('NotifySetConfigurationSuccessPacket', () => {
  it('should parse correctly', () => {
    const packet = new NotifySetConfigurationSuccessPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0xC4);
  });
});



