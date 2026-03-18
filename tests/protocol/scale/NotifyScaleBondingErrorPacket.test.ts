import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingErrorPacket } from '@/protocol/scale/NotifyScaleBondingErrorPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('NotifyScaleBondingErrorPacket', () => {
  it('should parse correctly with error code', () => {
    const payload = new Uint8Array([0x05]);
    const packet = NotifyScaleBondingErrorPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_ERROR);
    expect(packet.errorCode).toBe(5);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyScaleBondingErrorPacket(5);
    const encoded = packet.encode();
    // Opcode 0xB1 (177), Len 1, Error 5, Checksum 0xB7 (177+1+5=183=0xB7)
    expect(bytesToHex(encoded)).toBe('B10105B7');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyScaleBondingErrorPacket.fromPayload(new Uint8Array([0x05]));
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
