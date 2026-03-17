import { describe, it, expect } from 'vitest';
import { OperationErrorPacket } from '@/protocol/uplink/OperationErrorPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('OperationErrorPacket', () => {
  it('should parse correctly with error code', () => {
    const payload = new Uint8Array([0x01]);
    const packet = OperationErrorPacket.fromPayload(payload);
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
    expect(() => OperationErrorPacket.fromPayload(new Uint8Array(0))).toThrowError();
  });
});
