import { describe, it, expect } from 'vitest';
import { NotifyNfcTagRegisteredErrorAlreadyExistsPacket } from '@/protocol/uplink/NotifyNfcTagRegisteredErrorAlreadyExistsPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyNfcTagRegisteredErrorAlreadyExistsPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyNfcTagRegisteredErrorAlreadyExistsPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS);
  });
});
