import { describe, it, expect } from 'vitest';
import { NfcOpeningHistoryPacket } from '@/protocol/uplink/history/NfcOpeningHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('NfcOpeningHistoryPacket', () => {
  it('should parse age, tag type, UID and date correctly', () => {
    const age = 60;
    const now = Date.now();
    // Op: A1, Age: 00003C (60s), Type: 03, UIDLen: 04, UID: 04A1B2C3
    const payload = hexToBytes('00003C030404A1B2C3');
    const packet = NfcOpeningHistoryPacket.fromPayload(payload);
    
    expect(packet.age).toBe(age);
    expect(packet.tagType).toBe(3);
    expect(packet.uid).toBe('04A1B2C3');
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_NFC_OPENING);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
