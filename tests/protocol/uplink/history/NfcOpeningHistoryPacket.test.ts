import { describe, expect, it } from 'vitest';
import { NfcOpeningHistoryPacket } from '@/protocol/uplink/history/NfcOpeningHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NfcOpeningHistoryPacket', () => {
  it('should parse correctly with age, type and uid', () => {
    // UID 01020304
    const payload = new Uint8Array([0x00, 0x00, 0x0A, 0x01, 0x04, 0x01, 0x02, 0x03, 0x04, 0, 0, 0]);
    const packet = NfcOpeningHistoryPacket.fromPayload(payload);
    
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_NFC_OPENING);
    expect(packet.age).toBe(10);
    expect(packet.tagType).toBe(1);
    expect(packet.uid).toBe('01020304');
  });

  it('should throw on missing uid due to strict parsing', () => {
    const payload = new Uint8Array([0, 0, 10, 1, 4]);
    expect(() => NfcOpeningHistoryPacket.fromPayload(payload)).toThrowError('Payload too short');
  });

  it('should handle constructor with default parameters', () => {
    const packet = new NfcOpeningHistoryPacket();
    expect(packet.age).toBe(0);
    expect(packet.tagType).toBe(0);
    expect(packet.uid).toBe('');
  });
});
