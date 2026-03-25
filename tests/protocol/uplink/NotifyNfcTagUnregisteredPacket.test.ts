import { describe, it, expect } from 'vitest';
import { NotifyNfcTagUnregisteredPacket } from '@/protocol/uplink/NotifyNfcTagUnregisteredPacket';
import { BoksOpcode } from '@/protocol/constants';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('NotifyNfcTagUnregisteredPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyNfcTagUnregisteredPacket.fromRaw(buildMockRawPacket(NotifyNfcTagUnregisteredPacket.opcode, payload));
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED);
  });
});
