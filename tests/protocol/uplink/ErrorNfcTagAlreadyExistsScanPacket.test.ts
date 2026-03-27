import { describe, it, expect } from 'vitest';
import { ErrorNfcTagAlreadyExistsScanPacket } from '@/protocol/uplink/ErrorNfcTagAlreadyExistsScanPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ErrorNfcTagAlreadyExistsScanPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = ErrorNfcTagAlreadyExistsScanPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.ERROR_NFC_TAG_ALREADY_EXISTS_SCAN);
    expect(packet.status).toBe('already_exists');
  });
});
