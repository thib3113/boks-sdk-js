import { describe, it, expect } from 'vitest';
import { NotifyScaleMeasureWeightPacket } from '@/protocol/scale/NotifyScaleMeasureWeightPacket';
import { hexToBytes } from '@/utils/converters';

describe('NotifyScaleMeasureWeightPacket', () => {
  it('should parse weight correctly', () => {
    const packet = NotifyScaleMeasureWeightPacket.fromPayload(hexToBytes('000004D2')); // 1234
    expect(packet.weight).toBe(1234);
  });
});
