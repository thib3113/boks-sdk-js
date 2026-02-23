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
    const packet = AskDoorStatusPacket.fromPayload(new Uint8Array(0));
    expect(packet).toBeInstanceOf(AskDoorStatusPacket);
    expect(packet.opcode).toBe(BoksOpcode.ASK_DOOR_STATUS);
  });

  it('should handle extra payload bytes gracefully (ignore them)', () => {
      // Though toPayload() returns empty, if fromPayload is called with extra bytes, it currently ignores them.
      // The base class ensures opcode is correct.
      const packet = AskDoorStatusPacket.fromPayload(new Uint8Array([0x01, 0x02]));
      expect(packet).toBeInstanceOf(AskDoorStatusPacket);
  });
});
