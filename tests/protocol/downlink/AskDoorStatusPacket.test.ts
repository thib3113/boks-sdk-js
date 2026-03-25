import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { AskDoorStatusPacket } from '@/protocol/downlink/AskDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('AskDoorStatusPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new AskDoorStatusPacket();
    expect(packet.opcode).toBe(BoksOpcode.ASK_DOOR_STATUS);
    expect(bytesToHex(packet.encode())).toBe('020002');
  });

  it('should parse from payload correctly', () => {
    const packet = AskDoorStatusPacket.fromRaw(new Uint8Array(0));
    expect(packet).toBeInstanceOf(AskDoorStatusPacket);
    expect(packet.opcode).toBe(BoksOpcode.ASK_DOOR_STATUS);
  });

  it('should handle extra payload bytes gracefully (ignore them)', () => {
    // Though toPayload() returns empty, if fromRaw is called with extra bytes, it currently ignores them.
    // The base class ensures opcode is correct.
    const packet = AskDoorStatusPacket.fromRaw(new Uint8Array([0x01, 0x02]));
    expect(packet).toBeInstanceOf(AskDoorStatusPacket);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new AskDoorStatusPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 2,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([AskDoorStatusPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
