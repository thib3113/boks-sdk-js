import { describe, it, expect } from 'vitest';
import { BoksHardwareSimulator, SimulatorPacketEvent } from '../../src/simulator/BoksSimulator';
import { BoksOpcode } from '../../src/protocol/constants';
import { calculateChecksum } from '../../src/utils/converters';

describe('BoksHardwareSimulator Events', () => {
  it('should emit unknown packet when emitUnknownPacket is called', async () => {
    const simulator = new BoksHardwareSimulator();
    simulator.setResponseDelay(0);

    const events: SimulatorPacketEvent[] = [];
    simulator.onPacket((event) => {
      events.push(event);
    });

    simulator.emitUnknownPacket(0xFF, new Uint8Array([0xDE, 0xAD]));

    expect(events.length).toBe(1);
    expect(events[0].direction).toBe('TX');
    expect(events[0].data[0]).toBe(0xFF);
    expect(events[0].data[1]).toBe(2);
    expect(events[0].data[2]).toBe(0xDE);
    expect(events[0].data[3]).toBe(0xAD);
  });

  it('should emit TX and RX events on packet processing', async () => {
    const simulator = new BoksHardwareSimulator();
    // Use responseDelayMs = 0 to make it return immediately
    simulator.setResponseDelay(0);

    // Create an open door packet (downlink)
    // payload: 6 bytes pin
    const opcode = BoksOpcode.OPEN_DOOR;
    const payload = new Uint8Array([0x31, 0x32, 0x33, 0x34, 0x35, 0x36]); // "123456"

    const packetData = new Uint8Array(payload.length + 3);
    packetData[0] = opcode;
    packetData[1] = payload.length;
    packetData.set(payload, 2);
    packetData[packetData.length - 1] = calculateChecksum(
      packetData.subarray(0, packetData.length - 1)
    );

    const events: SimulatorPacketEvent[] = [];
    simulator.onPacket((event) => {
      events.push(event);
    });

    await simulator.handlePacket(packetData);

    // allow event loop to tick for async response (handlePacket uses setTimeout)
    await new Promise((r) => setTimeout(r, 10));

    // Should have 1 TX event (the request) and 1 RX event (the invalid open code response)
    expect(events.length).toBe(2);

    expect(events[0].direction).toBe('TX');
    expect(events[0].packet.opcode).toBe(opcode);

    expect(events[1].direction).toBe('RX');
    expect(events[1].packet.opcode).toBe(BoksOpcode.INVALID_OPEN_CODE);
  });
});
