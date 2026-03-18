import { describe, it, expect } from 'vitest';
import { ScaleMeasureWeightPacket } from '@/protocol/scale/ScaleMeasureWeightPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('ScaleMeasureWeightPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleMeasureWeightPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_MEASURE_WEIGHT);
    expect(bytesToHex(packet.encode())).toBe('570057');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleMeasureWeightPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_MEASURE_WEIGHT);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleMeasureWeightPacket();
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
