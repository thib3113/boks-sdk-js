import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { NotifyCodeGenerationSuccessPacket } from '@/protocol/uplink/NotifyCodeGenerationSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyCodeGenerationSuccessPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyCodeGenerationSuccessPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS);
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyCodeGenerationSuccessPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
