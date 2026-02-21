import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BoksHardwareSimulator, SimulatorTransport } from '../../src/simulator';
import { BoksOpcode } from '../../src/protocol/constants';
import { DeleteSingleUseCodePacket } from '../../src/protocol/downlink/DeleteSingleUseCodePacket';
import { OpenDoorPacket } from '../../src/protocol/downlink/OpenDoorPacket';

describe('Boks Hardware Simulator Integrity', () => {
  let simulator: BoksHardwareSimulator;
  let transport: SimulatorTransport;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let responseCallback: any;

  beforeEach(() => {
    simulator = new BoksHardwareSimulator();
    transport = new SimulatorTransport(simulator);
    responseCallback = vi.fn();
    transport.subscribe(responseCallback);
  });

  test('Should handle battery level read via GATT (0x2A19)', async () => {
    simulator.setBatteryLevel(75);
    const data = await transport.read('00002a19-0000-1000-8000-00805f9b34fb');
    expect(data[0]).toBe(75);
  });

  test('Should handle OPEN_DOOR (0x01) correctly', async () => {
    simulator.addPinCode('123456', 'single');
    const packet = new OpenDoorPacket('123456').encode();
    await transport.write(packet);

    expect(responseCallback).toHaveBeenCalled();
    const response = responseCallback.mock.calls[0][0];
    expect(response[0]).toBe(BoksOpcode.VALID_OPEN_CODE); // 0x81
    expect(simulator.getState().isOpen).toBe(true);
  });

  test('Should handle invalid OPEN_DOOR (0x01)', async () => {
    const packet = new OpenDoorPacket('000000').encode();
    await transport.write(packet);

    expect(responseCallback).toHaveBeenCalled();
    const response = responseCallback.mock.calls[0][0];
    expect(response[0]).toBe(BoksOpcode.INVALID_OPEN_CODE); // 0x82
    expect(simulator.getState().isOpen).toBe(false);
  });

  test('Should reproduce Opcode 0x0D BUG (Delete Single Use Code)', async () => {
    // 1. Setup: Add a single-use code
    simulator.addPinCode('654321', 'single');
    expect(simulator.getState().pinCodes.has('654321')).toBe(true);

    // 2. Action: Send DELETE_SINGLE_USE_CODE command
    // Payload: ConfigKey (8 bytes) + PIN (6 bytes)
    const command = new DeleteSingleUseCodePacket('00000000', '654321').encode();
    await transport.write(command);

    // 3. Verification:
    // A. Must return ERROR (0x78) despite success (The Bug)
    expect(responseCallback).toHaveBeenCalled();
    const response = responseCallback.mock.calls[0][0];
    expect(response[0]).toBe(BoksOpcode.CODE_OPERATION_ERROR); // 0x78

    // B. Code MUST be deleted from state
    expect(simulator.getState().pinCodes.has('654321')).toBe(false);
  });

  test('Should respect forced behaviors (Setters)', async () => {
    // Force Door Open
    simulator.setDoorStatus(true);
    expect(simulator.getState().isOpen).toBe(true);

    // Force Battery
    simulator.setBatteryLevel(10);
    expect(simulator.getState().batteryLevel).toBe(10);

    // Force Packet Loss (100%)
    simulator.setPacketLoss(1.0);
    // Even if valid, it should be dropped
    simulator.addPinCode('123456', 'single');
    const packet = new OpenDoorPacket('123456').encode();
    await transport.write(packet);

    // With 100% loss, either the incoming packet or the outgoing response is dropped.
    // In either case, no response callback.
    expect(responseCallback).not.toHaveBeenCalled();
  });
});
