import { describe, it, expect } from 'vitest';
import { NotifyScaleRawSensorsPacket } from '@/protocol/scale/NotifyScaleRawSensorsPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';

describe('NotifyScaleRawSensorsPacket', () => {
  it('should parse raw data correctly', () => {
    const packet = new NotifyScaleRawSensorsPacket();
    packet.parse(hexToBytes('AABBCC'));
    expect(bytesToHex(packet.data)).toBe('AABBCC');
  });
});



