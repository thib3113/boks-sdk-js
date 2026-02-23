import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BoksController } from '../../src/client/BoksController';
import { BoksHardwareSimulator } from '../../src/simulator/BoksSimulator';
import { SimulatorTransport } from '../../src/simulator/SimulatorTransport';
import { BoksOpcode } from '../../src/protocol/constants';
import { calculateChecksum } from '../../src/utils/converters';
import { BoksPacket } from '../../src/protocol';

// Helper to access private emit method
function emitPacket(simulator: BoksHardwareSimulator, opcode: number, payload: number[]) {
  const data = new Uint8Array(payload.length + 3);
  data[0] = opcode;
  data[1] = payload.length;
  data.set(payload, 2);
  data[data.length - 1] = calculateChecksum(data.subarray(0, data.length - 1));

  // Call private emit via any cast
  (simulator as any).emit(data);
}

describe('BoksController Internal State', () => {
  let simulator: BoksHardwareSimulator;
  let transport: SimulatorTransport;
  let controller: BoksController;

  beforeEach(async () => {
    simulator = new BoksHardwareSimulator();
    transport = new SimulatorTransport(simulator);
    controller = new BoksController({ transport });
    await controller.connect();
  });

  afterEach(async () => {
    await controller.disconnect();
  });

  it('should update door status when AnswerDoorStatusPacket (0x85) is received', async () => {
    // Simulate door open response: Inverted=0x00, Raw=0x01
    emitPacket(simulator, BoksOpcode.ANSWER_DOOR_STATUS, [0x00, 0x01]);

    // Allow event loop to process
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(controller.doorOpen).toBe(true);

    // Simulate door closed response: Inverted=0x01, Raw=0x00
    emitPacket(simulator, BoksOpcode.ANSWER_DOOR_STATUS, [0x01, 0x00]);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(controller.doorOpen).toBe(false);
  });

  it('should update door status when NotifyDoorStatusPacket (0x84) is received', async () => {
    // Simulate door open notification
    emitPacket(simulator, BoksOpcode.NOTIFY_DOOR_STATUS, [0x00, 0x01]);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(controller.doorOpen).toBe(true);
  });

  it('should update code count when NotifyCodesCountPacket (0xC3) is received', async () => {
    // Master: 5 (0x0005), Other: 10 (0x000A)
    emitPacket(simulator, BoksOpcode.NOTIFY_CODES_COUNT, [0x00, 0x05, 0x00, 0x0A]);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(controller.codeCount).toEqual({ master: 5, other: 10 });
  });

  it('should update log count when NotifyLogsCountPacket (0x79) is received', async () => {
    // Count: 123 (0x007B)
    emitPacket(simulator, BoksOpcode.NOTIFY_LOGS_COUNT, [0x00, 0x7B]);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(controller.logCount).toBe(123);
  });

  it('should allow external listeners to receive packets', async () => {
    const listener = vi.fn();
    // Access underlying client to add listener
    (controller as any).client.onPacket(listener);

    // Emit a packet
    emitPacket(simulator, BoksOpcode.NOTIFY_LOGS_COUNT, [0x00, 0x01]);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Internal state should update
    expect(controller.logCount).toBe(1);

    // External listener should be called
    expect(listener).toHaveBeenCalled();
    const packet = listener.mock.calls[0][0] as BoksPacket;
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_LOGS_COUNT);
  });
});
