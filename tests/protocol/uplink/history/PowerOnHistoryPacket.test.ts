import { describe, it, expect } from 'vitest';
import { PowerOnHistoryPacket } from '@/protocol/uplink/history/PowerOnHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('PowerOnHistoryPacket', () => {
  it('should parse correctly with age', () => {
    // age 0
    const payload = new Uint8Array([0x00, 0x00, 0x00]);
    const packet = PowerOnHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.POWER_ON);
    expect(packet.age).toBe(0);
  });

  it('should encode correctly', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x00]);
    const packet = new PowerOnHistoryPacket({ age: 0 }, payload);
    
    expect(bytesToHex(packet.toPayload())).toBe('000000');
    expect(bytesToHex(packet.encode())).toBe('960300000099');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new PowerOnHistoryPacket({ age: 0 });
    expect(bytesToHex(packet.encode())).toBe('960300000099');
  });
});
