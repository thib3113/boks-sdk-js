import { describe, it, expect } from 'vitest';
import { NfcRegisteringHistoryPacket } from '@/protocol/uplink/history/NfcRegisteringHistoryPacket';
import { hexToBytes, bytesToHex } from '@/utils/converters';

describe('NfcRegisteringHistoryPacket', () => {
  it('should parse age and data correctly', () => {
    const packet = NfcRegisteringHistoryPacket.fromPayload(hexToBytes('00003CAABBCC'));
    expect(packet.age).toBe(60);
    expect(bytesToHex(packet.data)).toBe('AABBCC');
  });
});
