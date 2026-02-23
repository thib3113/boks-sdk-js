import { describe, it, expect } from 'vitest';
import { NfcOpeningHistoryPacket } from '@/protocol/uplink/history/NfcOpeningHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NfcOpeningHistoryPacket', () => {
  it('should parse correctly with age, type and uid', () => {
    // Age 10
    // Type 1
    // Len 4
    // UID 01020304
    const payload = new Uint8Array([0x00, 0x00, 0x0A, 0x01, 0x04, 0x01, 0x02, 0x03, 0x04]);
    const packet = NfcOpeningHistoryPacket.fromPayload(payload);
    
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_NFC_OPENING);
    expect(packet.age).toBe(10);
    expect(packet.tagType).toBe(1);
    expect(packet.uid).toBe('01020304');
  });

  it('should handle missing uid', () => {
    // Missing UID bytes
    const payload = new Uint8Array([0x00, 0x00, 0x0A, 0x01, 0x04]);
    const packet = NfcOpeningHistoryPacket.fromPayload(payload);
    expect(packet.uid).toBe('');
  });
});
