import { describe, it, expect } from 'vitest';
import { RegeneratePartBPacket } from '@/protocol/downlink/RegeneratePartBPacket';
import { bytesToHex } from '@/utils/converters';

describe('RegeneratePartBPacket', () => {
  it('should generate correct binary for Regenerate Part B (0x21)', () => {
    const configKey = 'AABBCCDD';
    const part = new Uint8Array(16).fill(0xBB);
    const packet = new RegeneratePartBPacket(configKey, part);
    // 21 (Op) + 18 (Len=24) + Key(8) + Part(16) + CS
    // Sum: 33 + 24 + 532 + (16 * 187) = 3581 (0xDFD) -> 0xFD
    expect(bytesToHex(packet.encode())).toBe('21184141424243434444BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBFD');
  });
});



