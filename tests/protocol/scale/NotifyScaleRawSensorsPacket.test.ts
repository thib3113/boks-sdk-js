import { describe, it, expect } from 'vitest';
import { NotifyScaleRawSensorsPacket } from '@/protocol/scale/NotifyScaleRawSensorsPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('NotifyScaleRawSensorsPacket', () => {
  it('should parse correctly with data', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = NotifyScaleRawSensorsPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_RAW_SENSORS);
    expect(packet.data).toEqual(payload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyScaleRawSensorsPacket(new Uint8Array([0x01, 0x02, 0x03]));
    const encoded = packet.encode();
    // Opcode 0xB9 (185), Len 3, Data 010203, Checksum 0xC2 (185+3+1+2+3=194=0xC2)
    expect(bytesToHex(encoded)).toBe('B903010203C2');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyScaleRawSensorsPacket.fromPayload(new Uint8Array([0x01, 0x02, 0x03]));
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
