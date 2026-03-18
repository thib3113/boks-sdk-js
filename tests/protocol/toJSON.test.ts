import { describe, it, expect } from 'vitest';
import { OpenDoorPacket } from '@/protocol/downlink/OpenDoorPacket';
import { MultiToSingleCodePacket } from '@/protocol/downlink/MultiToSingleCodePacket';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { PayloadMapper } from '@/protocol/decorators';

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

  it('should ignore #private and _private variables', () => {
    class DummyPacket extends BoksPacket {
      get opcode() { return 0x99; }
      #privateVar = 10;
      getPrivate() { return this.#privateVar; }
      _privateVar = 20;
      publicVar = 30;
      constructor() { super(); }
    }

    PayloadMapper.defineSchema(DummyPacket, [
      { propertyName: '#privateVar', type: 'uint8', offset: 0 },
      { propertyName: '_privateVar', type: 'uint8', offset: 1 },
      { propertyName: 'publicVar', type: 'uint8', offset: 2 }
    ]);
    const packet = new DummyPacket();
    const json = packet.toJSON();
    expect(json).toEqual({ opcode: 0x99, publicVar: 30 });
  });
