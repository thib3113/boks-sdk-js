import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BoksController } from '../../src/client/BoksController';
import { BoksHardwareSimulator } from '../../src/simulator/BoksSimulator';
import { SimulatorTransport } from '../../src/simulator/SimulatorTransport';
import { BoksOpcode, BoksOpenSource } from '../../src/protocol/constants';

describe('BoksController Internal State', () => {
  let simulator: BoksHardwareSimulator;
  let transport: SimulatorTransport;
  let controller: BoksController;

  beforeEach(async () => {
    simulator = new BoksHardwareSimulator();
    // Use 0ms delay for instant test execution
    simulator.setProgressDelay(0);
    transport = new SimulatorTransport(simulator);
    controller = new BoksController({ transport });
    await controller.connect();
  });

  afterEach(async () => {
    await controller.disconnect();
  });

  it('should update door status when AnswerDoorStatusPacket (0x85) is received', async () => {
    // 1. Force state in simulator
    simulator.setDoorStatus(true);
    
    // 2. Trigger request (0x02 -> 0x85)
    await controller.getDoorStatus();

    // 3. Verify controller state was updated by the response
    expect(controller.doorOpen).toBe(true);

    simulator.setDoorStatus(false);
    await controller.getDoorStatus();
    expect(controller.doorOpen).toBe(false);
  });

  it('should update door status when NotifyDoorStatusPacket (0x84) is received', async () => {
    // Manually trigger door open in simulator (now emits 0x84)
    simulator.triggerDoorOpen(BoksOpenSource.Ble, 'NON_EXISTENT');
    
    // Give some time for notification delivery
    await vi.waitFor(() => expect(controller.doorOpen).toBe(true), { timeout: 1000 });
  });

  it('should update code count when NotifyCodesCountPacket (0xC3) is received', async () => {
    // Initial request
    await controller.countCodes();
    
    // Default: 5 master, 3300 others (approx due to collisions)
    expect(controller.codeCount.master).toBe(5);
    expect(controller.codeCount.other).toBeGreaterThan(3200);
  });

  it('should update log count when NotifyLogsCountPacket (0x79) is received', async () => {
    // Generate one log
    simulator.triggerDoorOpen(BoksOpenSource.PhysicalKey);
    
    // Get count (0x07 -> 0x79)
    const count = await controller.getLogsCount();
    
    expect(count).toBeGreaterThan(0);
    await vi.waitFor(() => expect(controller.logCount).toBe(count), { timeout: 1000 });
  });

  it('should allow external listeners to receive packets', async () => {
    // 1. Trigger an event to ensure logCount > 0
    simulator.triggerDoorOpen(BoksOpenSource.PhysicalKey);
    
    let capturedOpcode: number | null = null;
    controller.onPacket((p) => {
        capturedOpcode = p.opcode;
    });

    // 2. Trigger the count request (which also emits NOTIFY_LOGS_COUNT)
    await controller.getLogsCount();
    
    // 3. Wait for the packet to arrive at the external listener
    await vi.waitFor(() => expect(capturedOpcode).not.toBeNull(), { timeout: 1000 });
    
    expect(capturedOpcode).toBe(BoksOpcode.NOTIFY_LOGS_COUNT);
    expect(controller.logCount).toBeGreaterThan(0);
  });
});
