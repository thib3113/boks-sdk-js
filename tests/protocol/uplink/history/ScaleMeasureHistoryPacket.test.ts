import { describe, it, expect } from 'vitest';
import { ScaleMeasureHistoryPacket } from '@/protocol/uplink/history/ScaleMeasureHistoryPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';

describe('ScaleMeasureHistoryPacket', () => {
  it('should parse age and data correctly', () => {
    const packet = ScaleMeasureHistoryPacket.fromPayload(hexToBytes('00003CAABBCC'));
    expect(packet.age).toBe(60);
    expect(bytesToHex(packet.data)).toBe('AABBCC');
  });
});
