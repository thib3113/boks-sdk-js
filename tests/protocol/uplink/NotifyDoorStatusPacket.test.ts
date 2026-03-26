import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { NotifyDoorStatusPacket } from '@/protocol/uplink/NotifyDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyDoorStatusPacket', () => {
  it('should detect OPEN state (inv=false, status=true)', () => {
    const payload = new Uint8Array([0x00, 0x01]);
    const packet = NotifyDoorStatusPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_DOOR_STATUS);
    expect(packet.isOpen).toBe(true);
  });

  it('should encode correctly (Open)', () => {
    const packet = new NotifyDoorStatusPacket({ inverted: false, status: true });
    const encoded = packet.encode();
    // Opcode 0x84, Len 2, Inv 0, Status 1
    expect(encoded[0]).toBe(0x84);
    expect(encoded[1]).toBe(2);
    expect(bytesToHex(encoded.subarray(2, 4))).toBe('0001');
  });

  it('should encode correctly (Closed)', () => {
    const packet = new NotifyDoorStatusPacket({ inverted: true, status: false });
    const encoded = packet.encode();
    // Opcode 0x84, Len 2, Inv 1, Status 0
    expect(encoded[0]).toBe(0x84);
    expect(encoded[1]).toBe(2);
    expect(bytesToHex(encoded.subarray(2, 4))).toBe('0100');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyDoorStatusPacket({ inverted: false, status: true });
    // Opcode 0x84, Len 2, Payload 0001, Checksum 0x87 (132+2+0+1=135=0x87)
    expect(bytesToHex(packet.encode())).toBe('8402000187');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyDoorStatusPacket.fromRaw(new Uint8Array([0x00, 0x01]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "inverted": false,
        "opcode": 132,
        "status": true,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyDoorStatusPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
