import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { RegeneratePartAPacket } from '@/protocol/downlink/RegeneratePartAPacket';
import { bytesToHex } from '@/utils/converters';

describe('RegeneratePartAPacket', () => {
  it('should generate correct binary for Regenerate Part A (0x20)', () => {
    const configKey = 'AABBCCDD';
    const part = new Uint8Array(16).fill(0xAA);
    const packet = new RegeneratePartAPacket(configKey, part);
    // 20 (Op) + 18 (Len=24) + Key(8) + Part(16) + CS
    // Sum: 32 + 24 + 532 + (16 * 170) = 3308 (0xCEC) -> 0xEC
    expect(bytesToHex(packet.encode())).toBe('20184141424243434444AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEC');
  });
});



