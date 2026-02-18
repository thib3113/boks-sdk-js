import { describe, it, expect } from 'vitest';
import { NfcOpeningHistoryPacket } from '@/protocol/uplink/history/NfcOpeningHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('NfcOpeningHistoryPacket', () => {
  it('should parse age, tag type and UID correctly', () => {
    // Op: A1, Age: 00003C (60s), Type: 03, UIDLen: 04, UID: 04A1B2C3
    const payload = hexToBytes('00003C030404A1B2C3');
    const packet = new NfcOpeningHistoryPacket();
    packet.parse(payload);
    
    expect(packet.age).toBe(60);
    expect(packet.tagType).toBe(3);
    expect(packet.uid).toBe('04A1B2C3');
  });
});



