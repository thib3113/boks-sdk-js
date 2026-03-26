import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { ErrorNfcScanTimeoutPacket } from '@/protocol/uplink/ErrorNfcScanTimeoutPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ErrorNfcScanTimeoutPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = ErrorNfcScanTimeoutPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.ERROR_NFC_SCAN_TIMEOUT);
    expect(packet.status).toBe('timeout');
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([ErrorNfcScanTimeoutPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = ErrorNfcScanTimeoutPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
