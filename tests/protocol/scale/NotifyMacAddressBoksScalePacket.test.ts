import { describe, it, expect } from 'vitest';
import { NotifyMacAddressBoksScalePacket } from '@/protocol/scale/NotifyMacAddressBoksScalePacket';
import { hexToBytes } from '@/utils/converters';

describe('NotifyMacAddressBoksScalePacket', () => {
  it('should parse MAC address correctly', () => {
    const packet = new NotifyMacAddressBoksScalePacket();
    packet.parse(hexToBytes('AABBCCDDEEFF'));
    expect(packet.macAddress).toBe('AA:BB:CC:DD:EE:FF');
  });
});



