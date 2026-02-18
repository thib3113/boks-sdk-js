import { describe, it, expect } from 'vitest';
import { NotifyDoorStatusPacket } from '@/protocol/uplink/NotifyDoorStatusPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';

describe('NotifyDoorStatusPacket', () => {
  it('should parse closed status', () => {
    const packet = new NotifyDoorStatusPacket();
    const hex = '8402010087';
    packet.parse(hexToBytes('0100'));
    expect(packet.isOpen).toBe(false);
    expect(bytesToHex(packet.encode())).toBe(hex);
  });

  it('should parse open status', () => {
    const packet = new NotifyDoorStatusPacket();
    const hex = '8402000187';
    packet.parse(hexToBytes('0001'));
    expect(packet.isOpen).toBe(true);
    expect(bytesToHex(packet.encode())).toBe(hex);
  });
});



