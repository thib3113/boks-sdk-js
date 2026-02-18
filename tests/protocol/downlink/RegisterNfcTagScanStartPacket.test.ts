import { describe, it, expect } from 'vitest';
import { RegisterNfcTagScanStartPacket } from '@/protocol/downlink/RegisterNfcTagScanStartPacket';
import { bytesToHex } from '@/utils/converters';

describe('RegisterNfcTagScanStartPacket', () => {
  it('should generate correct binary for NFC scan start (0x17)', () => {
    const packet = new RegisterNfcTagScanStartPacket('AABBCCDD');
    // 17 (Op) + 08 (Len) + Key(8) + CS
    // Sum: 23 + 8 + 532 = 563 (0x233) -> 0x33
    expect(bytesToHex(packet.encode())).toBe('1708414142424343444433');
  });
});



