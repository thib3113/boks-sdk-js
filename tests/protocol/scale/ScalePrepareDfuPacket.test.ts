import { describe, it, expect } from 'vitest';
import { ScalePrepareDfuPacket } from '@/protocol/scale/ScalePrepareDfuPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('ScalePrepareDfuPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScalePrepareDfuPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_PREPARE_DFU);
    expect(bytesToHex(packet.encode())).toBe('600060');
  });

  it('should parse from payload correctly', () => {
    const packet = ScalePrepareDfuPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_PREPARE_DFU);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScalePrepareDfuPacket();
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
