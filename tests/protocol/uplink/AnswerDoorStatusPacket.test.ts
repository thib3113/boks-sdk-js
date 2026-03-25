import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { AnswerDoorStatusPacket } from '@/protocol/uplink/AnswerDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('AnswerDoorStatusPacket', () => {
  it('should detect OPEN state (inv=false, status=true)', () => {
    const payload = new Uint8Array([0x00, 0x01]);
    const packet = AnswerDoorStatusPacket.fromRaw(buildMockRawPacket(AnswerDoorStatusPacket.opcode, payload));
    expect(packet.opcode).toBe(BoksOpcode.ANSWER_DOOR_STATUS);
    expect(packet.isOpen).toBe(true);
  });

  it('should encode correctly (Open)', () => {
    const packet = new AnswerDoorStatusPacket({ inverted: false, status: true });
    const encoded = packet.encode();
    // Opcode 0x85, Len 2, Inv 0, Status 1
    expect(encoded[0]).toBe(0x85);
    expect(encoded[1]).toBe(2);
    expect(bytesToHex(encoded.subarray(2, 4))).toBe('0001');
  });

  it('should encode correctly (Closed)', () => {
    const packet = new AnswerDoorStatusPacket({ inverted: true, status: false });
    const encoded = packet.encode();
    // Opcode 0x85, Len 2, Inv 1, Status 0
    expect(encoded[0]).toBe(0x85);
    expect(encoded[1]).toBe(2);
    expect(bytesToHex(encoded.subarray(2, 4))).toBe('0100');
  });

  it('should throw BoksProtocolError if payload too short', () => {
    const payload = new Uint8Array(1);
    expect(() => AnswerDoorStatusPacket.fromRaw(buildMockRawPacket(AnswerDoorStatusPacket.opcode, payload))).toThrowError(BoksProtocolError);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = AnswerDoorStatusPacket.fromRaw(buildMockRawPacket(AnswerDoorStatusPacket.opcode, new Uint8Array([0x00, 0x01])));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "inverted": false,
        "opcode": 133,
        "status": true,
      });
  });
});
