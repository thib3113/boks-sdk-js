import { describe, expect, it } from 'vitest';
import { NfcOpeningHistoryPacket } from '@/protocol/uplink/history/NfcOpeningHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { bytesToHex } from '@/utils/converters';
import { buildMockRawPacket } from '../../../../utils/packet-builder';

describe('NfcOpeningHistoryPacket', () => {
  it('should parse correctly with age, type and uid', () => {
    // UID 04050607, type 2, age 10
    const payload = new Uint8Array([0x00, 0x00, 0x0a, 0x02, 0x04, 0x04, 0x05, 0x06, 0x07]);
    const packet = NfcOpeningHistoryPacket.fromRaw(buildMockRawPacket(NfcOpeningHistoryPacket.opcode, payload));

    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_NFC_OPENING);
    expect(packet.age).toBe(10);
    expect(packet.tagType).toBe(2);
    expect(packet.uid).toBe('04050607');
  });

  it('should encode correctly', () => {
    const packet = new NfcOpeningHistoryPacket({
      age: 10,
      tagType: 2,
      uid: '04050607'
    });
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0xa1);
    expect(encoded[1]).toBe(9);
    expect(bytesToHex(encoded.subarray(2, 5))).toBe('00000A');
    expect(encoded[5]).toBe(2);
    expect(encoded[6]).toBe(4);
    expect(bytesToHex(encoded.subarray(7, 11))).toBe('04050607');
  });

  it('should throw on invalid uid format', () => {
    expect(() => new NfcOpeningHistoryPacket({
      age: 10,
      tagType: 2,
      uid: 'invalid'
    })).toThrowError(BoksProtocolError);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NfcOpeningHistoryPacket.fromRaw(buildMockRawPacket(NfcOpeningHistoryPacket.opcode, new Uint8Array([0x00, 0x00, 0x0a, 0x02, 0x04, 0x04, 0x05, 0x06, 0x07])));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "opcode": 161,
        "tagType": 2,
        "uid": "04050607",
      });
  });
});
