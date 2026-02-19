import { describe, it, expect } from 'vitest';
import { NotifyScaleFaultyPacket } from '@/protocol/scale/NotifyScaleFaultyPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';

describe('NotifyScaleFaultyPacket', () => {
  it('should parse raw data correctly', () => {
    const packet = NotifyScaleFaultyPacket.fromPayload(hexToBytes('AABBCC'));
    expect(bytesToHex(packet.data)).toBe('AABBCC');
  });
});
