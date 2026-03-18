import { describe, it, expect } from 'vitest';
import { OpenDoorPacket } from '@/protocol/downlink/OpenDoorPacket';
import { MultiToSingleCodePacket } from '@/protocol/downlink/MultiToSingleCodePacket';

describe('toJSON method on BoksPacket', () => {
  it('should correctly serialize OpenDoorPacket (non-auth packet)', () => {
    const packet = new OpenDoorPacket('123456');
    const json = packet.toJSON();

    expect(json).toEqual({
      opcode: OpenDoorPacket.opcode,
      pin: '123456'
    });
  });

  it('should correctly serialize MultiToSingleCodePacket (auth packet)', () => {
    const packet = new MultiToSingleCodePacket({ configKey: 'A1B2C3D4', pin: '123456' });

    const json = packet.toJSON();
    expect(json).toEqual({
      opcode: MultiToSingleCodePacket.opcode,
      configKey: 'A1B2C3D4',
      pin: '123456'
    });
  });
});
