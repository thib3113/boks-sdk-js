import { describe, it, expect } from 'vitest';
import { ScaleReconnectPacket } from '@/protocol/scale/ScaleReconnectPacket';
import { bytesToHex } from '@/utils/converters';

describe('ScaleReconnectPacket', () => {
  it('should generate correct binary for ScaleReconnect (0x62)', () => {
    const packet = new ScaleReconnectPacket();
    expect(bytesToHex(packet.encode())).toBe('620062');
  });
});



