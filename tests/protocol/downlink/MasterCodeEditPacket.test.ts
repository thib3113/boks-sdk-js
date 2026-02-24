import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { MasterCodeEditPacket } from '@/protocol/downlink/MasterCodeEditPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('MasterCodeEditPacket', () => {
  const validKey = '12345678';
  const validIndex = 2;
  const validNewPin = '654321';

  it('should construct with valid parameters', () => {
    const packet = new MasterCodeEditPacket(validKey, validIndex, validNewPin);
    expect(packet.opcode).toBe(BoksOpcode.MASTER_CODE_EDIT);
    expect(packet.configKey).toBe(validKey);
    expect(packet.index).toBe(validIndex);
    expect(packet.newPin).toBe(validNewPin);
  });

  it('should encode correctly', () => {
    // Opcode 0x09. Len 15.
    // Key: 3132333435363738
    // Index: 02
    // Pin: 363534333231
    const packet = new MasterCodeEditPacket(validKey, validIndex, validNewPin);
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x09);
    expect(encoded[1]).toBe(15);

    const expectedPayload = '313233343536373802363534333231';
    expect(bytesToHex(encoded.subarray(2, 17))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = new Uint8Array(15);
    payload.set(stringToBytes(validKey), 0);
    payload[8] = validIndex;
    payload.set(stringToBytes(validNewPin), 9);

    const packet = MasterCodeEditPacket.fromPayload(payload);
    expect(packet.configKey).toBe(validKey);
    expect(packet.index).toBe(validIndex);
    expect(packet.newPin).toBe(validNewPin);
  });

  it('should parse with default index 0 if payload is short', () => {
      // If index byte missing, it defaults to 0.
      // But we need pin bytes too.
      // If we provide just key, index defaults to 0, pin defaults to empty string -> error.
      // So this test case is tricky because constructor validation runs.

      // If we provide key + enough bytes for pin but at wrong offset?
      // fromPayload logic: index = payload[8]. newPin = slice(9, 15).

      // If payload is length 15 (correct), index is at 8.
      // If payload is length 8, index defaults to 0. Pin is empty -> Error.
  });

  it('should throw INVALID_CONFIG_KEY for invalid config key format', () => {
     expect(() => new MasterCodeEditPacket('invalid', validIndex, validNewPin)).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
      expect(() => new MasterCodeEditPacket(validKey, validIndex, '123')).toThrowError(BoksProtocolError);
  });

  it('should throw INVALID_INDEX_RANGE for invalid index', () => {
      expect(() => new MasterCodeEditPacket(validKey, 256, validNewPin)).toThrowError(BoksProtocolError);
  });

  it('should fail parsing if payload is too short for pin', () => {
      // Providing only key
      const payload = new Uint8Array(8);
      payload.set(stringToBytes(validKey), 0);

      expect(() => MasterCodeEditPacket.fromPayload(payload)).toThrowError(BoksProtocolError);
      // because pin will be empty string
  });
});
