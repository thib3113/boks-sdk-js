import { describe, it, expect } from 'vitest';
import { ScaleGetRawSensorsPacket } from '@/protocol/scale/ScaleGetRawSensorsPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('ScaleGetRawSensorsPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleGetRawSensorsPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_RAW_SENSORS);
    expect(bytesToHex(packet.encode())).toBe('610061');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleGetRawSensorsPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_RAW_SENSORS);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleGetRawSensorsPacket();
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
