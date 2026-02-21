import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BoksHardwareSimulator, SimulatorTransport, SimulatorStorage } from '../../src/simulator';
import { BoksOpcode, BoksCodeType, BoksOpenSource } from '../../src/protocol/constants';
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
    simulator.addPinCode('123456', BoksCodeType.Single);
    const packet = new OpenDoorPacket('123456').encode();
    await transport.write(packet);

    expect(responseCallback).toHaveBeenCalled();
    const response = responseCallback.mock.calls[0][0];
    expect(response[0]).toBe(BoksOpcode.VALID_OPEN_CODE); // 0x81
    expect(simulator.getState().isOpen).toBe(true);

    // Check Logs
    const state = simulator.getState();
    const lastLog = state.logs[state.logs.length - 1];
    // Should log OPEN_DOOR (0x91) as per handleOpenDoor implementation
    // And handleOpenDoor now calls triggerDoorOpen(Ble), so it should also log LOG_CODE_BLE_VALID (0x86)

    // We expect at least 2 logs: 0x86 then 0x91
    expect(state.logs.length).toBeGreaterThanOrEqual(2);
    expect(state.logs[state.logs.length - 2].opcode).toBe(BoksOpcode.LOG_CODE_BLE_VALID);
    expect(state.logs[state.logs.length - 1].opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
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
    simulator.addPinCode('654321', BoksCodeType.Single);
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
    simulator.addPinCode('123456', BoksCodeType.Single);
    const packet = new OpenDoorPacket('123456').encode();
    await transport.write(packet);

    // With 100% loss, either the incoming packet or the outgoing response is dropped.
    // In either case, no response callback.
    expect(responseCallback).not.toHaveBeenCalled();
  });

  describe('Storage Persistence', () => {
    test('Should load state from storage', () => {
      const mockStorage: SimulatorStorage = {
        get: vi.fn((key) => {
          if (key === 'configKey') return '12345678';
          if (key === 'pinCodes') return JSON.stringify([['111111', BoksCodeType.Master]]);
          return null;
        }),
        set: vi.fn()
      };

      const sim = new BoksHardwareSimulator(mockStorage);
      const state = sim.getState();

      expect(state.configKey).toBe('12345678');
      expect(state.pinCodes.get('111111')).toBe(BoksCodeType.Master);
    });

    test('Should save state to storage on changes', () => {
      const mockStorage: SimulatorStorage = {
        get: vi.fn(() => null),
        set: vi.fn()
      };

      const sim = new BoksHardwareSimulator(mockStorage);

      // Add PIN
      sim.addPinCode('222222', BoksCodeType.Multi);
      expect(mockStorage.set).toHaveBeenCalledWith('pinCodes', expect.stringContaining('222222'));

      // Set Config Key
      sim.setConfigKey('87654321');
      expect(mockStorage.set).toHaveBeenCalledWith('configKey', '87654321');
    });
  });

  describe('triggerDoorOpen and Logging', () => {
    test('Should generate correct logs for BLE source', () => {
      simulator.triggerDoorOpen(BoksOpenSource.Ble, '123456');
      const logs = simulator.getState().logs;

      // Expect 0x86 (BLE Valid) and 0x91 (Door Open)
      const lastLogs = logs.slice(-2);
      expect(lastLogs[0].opcode).toBe(BoksOpcode.LOG_CODE_BLE_VALID);
      expect(lastLogs[1].opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
      expect(simulator.getState().isOpen).toBe(true);
    });

    test('Should generate correct logs for Keypad source', () => {
      simulator.triggerDoorOpen(BoksOpenSource.Keypad, '654321');
      const logs = simulator.getState().logs;

      // Expect 0x87 (Keypad Valid) and 0x91 (Door Open)
      const lastLogs = logs.slice(-2);
      expect(lastLogs[0].opcode).toBe(BoksOpcode.LOG_CODE_KEY_VALID);
      expect(lastLogs[1].opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
    });

    test('Should generate correct logs for Physical Key source', () => {
      simulator.triggerDoorOpen(BoksOpenSource.PhysicalKey);
      const logs = simulator.getState().logs;

      // Expect 0x99 (Key Opening) and 0x91 (Door Open)
      const lastLogs = logs.slice(-2);
      expect(lastLogs[0].opcode).toBe(BoksOpcode.LOG_EVENT_KEY_OPENING);
      expect(lastLogs[1].opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
    });

    test('Should generate correct logs for NFC source', () => {
      simulator.triggerDoorOpen(BoksOpenSource.Nfc, 'AABBCCDD');
      const logs = simulator.getState().logs;

      // Expect 0xA1 (NFC Opening) and 0x91 (Door Open)
      const lastLogs = logs.slice(-2);
      expect(lastLogs[0].opcode).toBe(BoksOpcode.LOG_EVENT_NFC_OPENING);
      expect(lastLogs[1].opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
    });
  });
});
