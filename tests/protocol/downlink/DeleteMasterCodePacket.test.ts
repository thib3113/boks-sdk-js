import { describe, it, expect } from 'vitest';
import { DeleteMasterCodePacket } from '@/protocol/downlink/DeleteMasterCodePacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('DeleteMasterCodePacket', () => {
  const validKey = '12345678';
  const validIndex = 2;

  it('should construct with valid parameters', () => {
    const packet = new DeleteMasterCodePacket({ configKey: validKey, index: validIndex });
    expect(packet.opcode).toBe(BoksOpcode.DELETE_MASTER_CODE);
    expect(packet.configKey).toBe(validKey);
    expect(packet.index).toBe(validIndex);
  });

  it('should encode correctly', () => {
    // 0x0C + len(9) + key(8) + index(1) + checksum
    const packet = new DeleteMasterCodePacket({ configKey: validKey, index: validIndex });
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x0c);
    expect(encoded[1]).toBe(9);

    // Key "12345678" -> 3132333435363738 + 02
    const expectedPayload = '313233343536373802';
    expect(bytesToHex(encoded.subarray(2, 11))).toBe(expectedPayload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new DeleteMasterCodePacket({ configKey: '12345678', index: 2 });
    // Opcode 0x0C, Len 9, Key '12345678', Index 2, Checksum 0xD1
    expect(bytesToHex(packet.encode())).toBe('0C09313233343536373802BB');
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(9);
    payload.set(stringToBytes(validKey), 0);
    payload[8] = validIndex;

    const packet = DeleteMasterCodePacket.fromRaw(buildMockRawPacket(DeleteMasterCodePacket.opcode, payload));
    expect(packet.configKey).toBe(validKey);
    expect(packet.index).toBe(validIndex);
  });

  it('should fail to parse if payload is short', () => {
    const payload = new Uint8Array(8);
    payload.set(stringToBytes(validKey), 0);

    expect(() => DeleteMasterCodePacket.fromRaw(buildMockRawPacket(DeleteMasterCodePacket.opcode, payload))).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
    expect(
      () => new DeleteMasterCodePacket({ configKey: 'invalid', index: validIndex })
    ).toThrowError(BoksProtocolError);
    try {
      new DeleteMasterCodePacket({ configKey: 'invalid', index: validIndex });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_CONFIG_KEY);
    }
  });

  it('should throw INVALID_INDEX_RANGE for invalid index', () => {
    expect(() => new DeleteMasterCodePacket({ configKey: validKey, index: -1 })).toThrowError(
      BoksProtocolError
    );
    expect(() => new DeleteMasterCodePacket({ configKey: validKey, index: 256 })).toThrowError(
      BoksProtocolError
    );

    try {
      new DeleteMasterCodePacket({ configKey: validKey, index: 256 });
    } catch (e) {
      expect((e as BoksProtocolError).id).toBe(BoksProtocolErrorId.INVALID_INDEX_RANGE);
    }
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new DeleteMasterCodePacket({ configKey: validKey, index: validIndex });
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "configKey": "12345678",
        "index": 2,
        "opcode": 12,
      });
  });
});
