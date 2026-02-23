import { describe, it, expect } from 'vitest';
import { NotifyMacAddressBoksScalePacket } from '@/protocol/scale/NotifyMacAddressBoksScalePacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyMacAddressBoksScalePacket', () => {
  it('should parse correctly', () => {
    // AA:BB:CC:DD:EE:FF
    const payload = new Uint8Array([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]);
    const packet = NotifyMacAddressBoksScalePacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_MAC_ADDRESS_BOKS_SCALE);
    expect(packet.macAddress).toBe('AA:BB:CC:DD:EE:FF');
  });

  it('should handle empty payload', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyMacAddressBoksScalePacket.fromPayload(payload);
    expect(packet.macAddress).toBe('');
  });
});
