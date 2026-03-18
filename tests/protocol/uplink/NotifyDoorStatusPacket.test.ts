import { describe, it, expect } from 'vitest';
import { NotifyDoorStatusPacket } from '@/protocol/uplink/NotifyDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('NotifyDoorStatusPacket', () => {
  it('should detect OPEN state (inv=false, raw=true)', () => {
    const payload = new Uint8Array([0x00, 0x01]);
    const packet = NotifyDoorStatusPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_DOOR_STATUS);
    expect(packet.isOpen).toBe(true);
  });

  it('should encode correctly (Open)', () => {
    const packet = new NotifyDoorStatusPacket({ inverted: false, raw: true });
    const encoded = packet.encode();
    // Opcode 0x84, Len 2, Inv 0, Raw 1
    expect(encoded[0]).toBe(0x84);
    expect(encoded[1]).toBe(2);
    expect(bytesToHex(encoded.subarray(2, 4))).toBe('0001');
  });

  it('should encode correctly (Closed)', () => {
    const packet = new NotifyDoorStatusPacket({ inverted: true, raw: false });
    const encoded = packet.encode();
    // Opcode 0x84, Len 2, Inv 1, Raw 0
    expect(encoded[0]).toBe(0x84);
    expect(encoded[1]).toBe(2);
    expect(bytesToHex(encoded.subarray(2, 4))).toBe('0100');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyDoorStatusPacket({ inverted: false, raw: true });
    // Opcode 0x84, Len 2, Payload 0001, Checksum 0x87 (132+2+0+1=135=0x87)
    expect(bytesToHex(packet.encode())).toBe('8402000187');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyDoorStatusPacket.fromPayload(new Uint8Array([0x00, 0x01]));
    const json = packet.toJSON();
    expect(json).toStrictEqual(
        Object.assign({ opcode: packet.opcode },
        Object.fromEntries(
            PayloadMapper.getFields(packet.constructor)
            .map((f: any) => [f.propertyName, (packet as any)[f.propertyName]])
        ))
    );
  });
});
