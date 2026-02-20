import { describe, it, expect } from 'vitest';
import { NfcRegisteringHistoryPacket } from '@/protocol/uplink/history/NfcRegisteringHistoryPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('NfcRegisteringHistoryPacket', () => {
  it('should parse age, data and date correctly', () => {
    const age = 60;
    const now = Date.now();
    const payload = hexToBytes('00003CAABBCC'); // 60s, Data AABBCC
    const packet = NfcRegisteringHistoryPacket.fromPayload(payload);

    expect(packet.age).toBe(age);
    expect(bytesToHex(packet.data)).toBe('AABBCC');
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_NFC_REGISTERING);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
