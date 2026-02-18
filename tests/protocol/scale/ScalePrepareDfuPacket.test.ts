import { describe, it, expect } from 'vitest';
import { ScalePrepareDfuPacket } from '@/protocol/scale/ScalePrepareDfuPacket';
import { bytesToHex } from '@/utils/converters';

describe('ScalePrepareDfuPacket', () => {
  it('should generate correct binary for ScalePrepareDfu (0x60)', () => {
    const packet = new ScalePrepareDfuPacket();
    expect(bytesToHex(packet.encode())).toBe('600060');
  });
});



