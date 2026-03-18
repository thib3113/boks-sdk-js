import { describe, it, expect } from 'vitest';
import { NotifyScaleFaultyPacket } from '@/protocol/scale/NotifyScaleFaultyPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('NotifyScaleFaultyPacket', () => {
  it('should parse correctly with data', () => {
    const payload = new Uint8Array([0x01, 0x02]);
    const packet = NotifyScaleFaultyPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_FAULTY);
    expect(packet.data).toEqual(payload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyScaleFaultyPacket(new Uint8Array([0x01, 0x02]));
    const encoded = packet.encode();
    // Opcode 0xBA (186), Len 2, Data 0102, Checksum 0xBD (186+2+1+2=191=0xBF ? Wait)
    // 186 + 2 + 1 + 2 = 191 (0xBF)
    expect(bytesToHex(encoded)).toBe('BA020102BF');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyScaleFaultyPacket.fromPayload(new Uint8Array([0x01, 0x02]));
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
