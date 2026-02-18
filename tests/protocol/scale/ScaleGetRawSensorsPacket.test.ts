import { describe, it, expect } from 'vitest';
import { ScaleGetRawSensorsPacket } from '@/protocol/scale/ScaleGetRawSensorsPacket';
import { bytesToHex } from '@/utils/converters';

describe('ScaleGetRawSensorsPacket', () => {
  it('should generate correct binary for ScaleGetRawSensors (0x61)', () => {
    const packet = new ScaleGetRawSensorsPacket();
    expect(bytesToHex(packet.encode())).toBe('610061');
  });
});



