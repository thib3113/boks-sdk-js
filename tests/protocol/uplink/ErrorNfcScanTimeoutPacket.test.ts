import { describe, it, expect } from 'vitest';
import { ErrorNfcScanTimeoutPacket } from '@/protocol/uplink/ErrorNfcScanTimeoutPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ErrorNfcScanTimeoutPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = ErrorNfcScanTimeoutPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.ERROR_NFC_SCAN_TIMEOUT);
    expect(packet.status).toBe('timeout');
  });
});
