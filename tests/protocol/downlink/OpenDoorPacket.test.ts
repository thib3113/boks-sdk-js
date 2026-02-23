import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { OpenDoorPacket } from '@/protocol/downlink/OpenDoorPacket';
import { bytesToHex } from '@/utils/converters';

describe('OpenDoorPacket', () => {
  it('should generate correct binary for OpenDoor (0x01) with PIN', () => {
    const packet = new OpenDoorPacket('123456');
    expect(bytesToHex(packet.encode())).toBe('01063132333435363C');
  });

  it('should throw error for invalid PIN', () => {
    expect(() => new OpenDoorPacket('123')).toThrow(BoksProtocolErrorId.INVALID_PIN_FORMAT);
    expect(() => new OpenDoorPacket('12345C')).toThrow(BoksProtocolErrorId.INVALID_PIN_FORMAT);
  });
});



