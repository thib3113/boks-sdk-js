import { describe, it, expect } from 'vitest';
import { NotifyDoorStatusPacket } from '@/protocol/uplink/NotifyDoorStatusPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';

describe('NotifyDoorStatusPacket', () => {
  it('should parse closed status', () => {
    const hex = '8402010087';
    const packet = NotifyDoorStatusPacket.fromPayload(hexToBytes('0100'));
    expect(packet.isOpen).toBe(false);
    expect(bytesToHex(packet.encode())).toBe(hex);
  });

  it('should parse open status', () => {
    const hex = '8402000187';
    const packet = NotifyDoorStatusPacket.fromPayload(hexToBytes('0001'));
    expect(packet.isOpen).toBe(true);
    expect(bytesToHex(packet.encode())).toBe(hex);
  });
});
