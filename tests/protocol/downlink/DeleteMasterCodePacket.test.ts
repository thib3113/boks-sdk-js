import { describe, it, expect } from 'vitest';
import { DeleteMasterCodePacket } from '@/protocol/downlink/DeleteMasterCodePacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('DeleteMasterCodePacket', () => {
  const validKey = '12345678';
  const validIndex = 5;

  it('should construct with valid parameters', () => {
    const packet = new DeleteMasterCodePacket(validKey, validIndex);
    expect(packet.opcode).toBe(BoksOpcode.DELETE_MASTER_CODE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.index).toBe(validIndex);
  });

  it('should encode correctly', () => {
    // 0x0C + len(9) + key(8) + index(1) + checksum
    const packet = new DeleteMasterCodePacket(validKey, validIndex);
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x0C);
    expect(encoded[1]).toBe(9);

    // Key "12345678" -> 3132333435363738 + 05
    const expectedPayload = '313233343536373805';
    expect(bytesToHex(encoded.subarray(2, 11))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(9);
    payload.set(stringToBytes(validKey), 0);
    payload[8] = validIndex;

    const packet = DeleteMasterCodePacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.index).toBe(validIndex);
  });

  it('should parse with default index 0 if payload is short', () => {
    const payload = new Uint8Array(8);
    payload.set(stringToBytes(validKey), 0);

    const packet = DeleteMasterCodePacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.index).toBe(0);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new DeleteMasterCodePacket('invalid', validIndex)).toThrowError(BoksProtocolError);
     try {
       new DeleteMasterCodePacket('invalid', validIndex);
     } catch (e) {
       expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_CONFIG_KEY);
     }
  });

  it('should throw INVALID_INDEX_RANGE for invalid index', () => {
      expect(() => new DeleteMasterCodePacket(validKey, -1)).toThrowError(BoksProtocolError);
      expect(() => new DeleteMasterCodePacket(validKey, 256)).toThrowError(BoksProtocolError);

      try {
        new DeleteMasterCodePacket(validKey, 256);
      } catch (e) {
         expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_INDEX_RANGE);
      }
  });
});
