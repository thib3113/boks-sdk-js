import { describe, it, expect, vi } from 'vitest';
import { BoksEventRouter } from '@/client/BoksEventRouter';
import { BoksOpcode, AnswerDoorStatusPacket, NotifyDoorStatusPacket, AskDoorStatusPacket } from '@/protocol';

type TestEventMap = Record<string, unknown> & {
  doorStateChanged: boolean;
};

describe('BoksEventRouter', () => {
  it('should route events by direction', () => {
    const router = new BoksEventRouter<TestEventMap>();

    const rxListener = vi.fn();
    const txListener = vi.fn();

    router.on('RX', rxListener);
    router.on('TX', txListener);

    const packet = new AskDoorStatusPacket();
    router.emitClientEvent(packet, 'TX');
    router.emitClientEvent(packet, 'RX');

    expect(rxListener).toHaveBeenCalledTimes(1);
    expect(txListener).toHaveBeenCalledTimes(1);
  });

  it('should route events by opcode', () => {
    const router = new BoksEventRouter<TestEventMap>();

    const opListener = vi.fn();
    router.on(BoksOpcode.ASK_DOOR_STATUS, opListener);

    const packet1 = new AskDoorStatusPacket();
    const packet2 = new AnswerDoorStatusPacket({ inverted: false, raw: true });

    router.emitClientEvent(packet1, 'TX');
    router.emitClientEvent(packet2, 'RX');

    expect(opListener).toHaveBeenCalledTimes(1);
    expect(opListener).toHaveBeenCalledWith(packet1, 'TX');
  });

  it('should route events by Class and infer type', () => {
    const router = new BoksEventRouter<TestEventMap>();

    const classListener = vi.fn();

    // Test type inference implicitly via usage in callback
    router.on(AnswerDoorStatusPacket, (packet, dir) => {
      // Type should be AnswerDoorStatusPacket
      const isOpen: boolean = packet.isOpen;
      classListener(isOpen, dir);
    });

    const packet1 = new AnswerDoorStatusPacket({ inverted: false, raw: true });
    const packet2 = new AskDoorStatusPacket();

    router.emitClientEvent(packet1, 'RX');
    router.emitClientEvent(packet2, 'TX');

    expect(classListener).toHaveBeenCalledTimes(1);
    expect(classListener).toHaveBeenCalledWith(true, 'RX');
  });

  it('should route events by array of mixed filters', () => {
    const router = new BoksEventRouter<TestEventMap>();

    const mixedListener = vi.fn();

    router.on(['TX', AnswerDoorStatusPacket], mixedListener);

    const packet1 = new AskDoorStatusPacket();
    const packet2 = new AnswerDoorStatusPacket({ inverted: false, raw: false });
    const packet3 = new NotifyDoorStatusPacket({ inverted: false, raw: true });

    router.emitClientEvent(packet1, 'TX'); // matches TX
    router.emitClientEvent(packet2, 'RX'); // matches Class
    router.emitClientEvent(packet3, 'RX'); // NO MATCH

    expect(mixedListener).toHaveBeenCalledTimes(2);
    expect(mixedListener).toHaveBeenCalledWith(packet1, 'TX');
    expect(mixedListener).toHaveBeenCalledWith(packet2, 'RX');
  });

  it('should route high-level events', () => {
    const router = new BoksEventRouter<TestEventMap>();

    const doorListener = vi.fn();
    router.on('doorStateChanged', doorListener);

    // Handle initial state change
    router.emit('doorStateChanged', true);
    expect(doorListener).toHaveBeenCalledTimes(1);
    expect(doorListener).toHaveBeenCalledWith(true, undefined);

    // Handle subsequent state change
    router.emit('doorStateChanged', false);
    expect(doorListener).toHaveBeenCalledTimes(2);
    expect(doorListener).toHaveBeenCalledWith(false, undefined);
  });

  it('should unregister listeners correctly', () => {
    const router = new BoksEventRouter<TestEventMap>();
    const rxListener = vi.fn();

    const off = router.on('RX', rxListener);

    const packet = new AskDoorStatusPacket();
    router.emitClientEvent(packet, 'RX');
    expect(rxListener).toHaveBeenCalledTimes(1);

    off(); // or router.off('RX', rxListener)

    router.emitClientEvent(packet, 'RX');
    expect(rxListener).toHaveBeenCalledTimes(1); // Still 1
  });
});
