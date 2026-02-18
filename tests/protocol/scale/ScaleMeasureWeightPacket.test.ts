import { describe, it, expect } from 'vitest';
import { ScaleMeasureWeightPacket } from '@/protocol/scale/ScaleMeasureWeightPacket';
import { bytesToHex } from '@/utils/converters';

describe('ScaleMeasureWeightPacket', () => {
  it('should generate correct binary for ScaleMeasureWeight (0x57)', () => {
    const packet = new ScaleMeasureWeightPacket();
    expect(bytesToHex(packet.encode())).toBe('570057');
  });
});



