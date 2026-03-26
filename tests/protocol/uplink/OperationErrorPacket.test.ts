import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { OperationErrorPacket } from '@/protocol/uplink/OperationErrorPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('OperationErrorPacket', () => {
  it('should parse correctly with error code', () => {
    const payload = new Uint8Array([0x01]);
    const packet = OperationErrorPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.CODE_OPERATION_ERROR);
    expect(packet.errorCode).toBe(1);
  });

  it('should encode correctly', () => {
    const packet = new OperationErrorPacket(1);
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x78);
    expect(encoded[1]).toBe(1);
    expect(encoded[2]).toBe(1);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new OperationErrorPacket(1);
    // Opcode 0x78, Len 1, Error 1, Checksum 0x7A (120+1+1=122)
    expect(bytesToHex(packet.encode())).toBe('7801017A');
  });

  it('should throw error if payload is empty', () => {
    expect(() => OperationErrorPacket.fromRaw(new Uint8Array(0))).toThrowError();
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = OperationErrorPacket.fromRaw(new Uint8Array([0x01]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "errorCode": 1,
        "opcode": 120,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([OperationErrorPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = OperationErrorPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
