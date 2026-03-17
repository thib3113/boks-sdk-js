import { describe, it, expect } from 'vitest';
import { PowerOffHistoryPacket } from '@/protocol/uplink/history/PowerOffHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('PowerOffHistoryPacket', () => {
  it('should parse correctly with age and reason', () => {
    // age 60 (0x3c), reason 1
    const payload = new Uint8Array([0x00, 0x00, 0x3c, 0x01]);
    const packet = PowerOffHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.POWER_OFF);
    expect(packet.age).toBe(60);
    expect(packet.reason).toBe(1);
  });

  it('should encode correctly', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x3c, 0x01]);
    const packet = new PowerOffHistoryPacket({ age: 60, reason: 1 }, payload);
    
    expect(bytesToHex(packet.toPayload())).toBe('00003C01');
    expect(bytesToHex(packet.encode())).toBe('940400003C01D5');
  });

  it('should throw error on missing reason', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0a]);
    expect(() => PowerOffHistoryPacket.fromPayload(payload)).toThrowError();
  });
});
