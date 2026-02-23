import { describe, it, expect } from 'vitest';
import { ScaleGetRawSensorsPacket } from '@/protocol/scale/ScaleGetRawSensorsPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

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
});
