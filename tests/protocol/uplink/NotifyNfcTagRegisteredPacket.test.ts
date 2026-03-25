import { describe, it, expect } from 'vitest';
import { NotifyNfcTagRegisteredPacket } from '@/protocol/uplink/NotifyNfcTagRegisteredPacket';
import { BoksOpcode } from '@/protocol/constants';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('NotifyNfcTagRegisteredPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyNfcTagRegisteredPacket.fromRaw(buildMockRawPacket(NotifyNfcTagRegisteredPacket.opcode, payload));
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_REGISTERED);
  });
});
