import { describe, it, expect } from 'vitest';
import { NfcRegisteringHistoryPacket } from '@/protocol/uplink/history/NfcRegisteringHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NfcRegisteringHistoryPacket', () => {
  it('should parse correctly with age and data', () => {
    // 0x01, 0x02, 0x03, 0x04 -> Data
    const payload = new Uint8Array([0x00, 0x00, 0x0A, 0x01, 0x02, 0x03, 0x04]);
    const packet = NfcRegisteringHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_NFC_REGISTERING);
    expect(packet.age).toBe(10);
    expect(packet.data).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
  });

  it('should handle missing data', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0A]);
    const packet = NfcRegisteringHistoryPacket.fromPayload(payload);
    expect(packet.data.length).toBe(0);
  });
});
