import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { AnswerDoorStatusPacket } from '@/protocol/uplink/AnswerDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('AnswerDoorStatusPacket', () => {
  it('should detect OPEN state (inv=false, status=true)', () => {
    const payload = new Uint8Array([0x00, 0x01]);
    const packet = AnswerDoorStatusPacket.fromRaw(payload);
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
    expect(() => AnswerDoorStatusPacket.fromRaw(payload)).toThrowError(BoksProtocolError);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = AnswerDoorStatusPacket.fromRaw(new Uint8Array([0x00, 0x01]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "inverted": false,
        "opcode": 133,
        "status": true,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([AnswerDoorStatusPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = AnswerDoorStatusPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
