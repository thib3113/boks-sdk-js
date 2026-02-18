import { describe, it, expect } from 'vitest';
import { OpenDoorPacket } from '@/protocol/downlink/OpenDoorPacket';
import { bytesToHex } from '@/utils/converters';

describe('OpenDoorPacket', () => {
  it('should generate correct binary for OpenDoor (0x01) with PIN', () => {
    const packet = new OpenDoorPacket("123456");
    expect(bytesToHex(packet.encode())).toBe('01063132333435363C');
  });

  it('should generate correct binary for OpenDoor (0x01) without PIN', () => {
    const packet = new OpenDoorPacket();
    expect(bytesToHex(packet.encode())).toBe('010001');
  });
});



