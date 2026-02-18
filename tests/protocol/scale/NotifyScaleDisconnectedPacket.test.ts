import { describe, it, expect } from 'vitest';
import { NotifyScaleDisconnectedPacket } from '@/protocol/scale/NotifyScaleDisconnectedPacket';

describe('NotifyScaleDisconnectedPacket', () => {
  it('should parse correctly', () => {
    const packet = new NotifyScaleDisconnectedPacket();
    packet.parse(new Uint8Array(0));
    expect(packet.opcode).toBe(0xB8);
  });
});



