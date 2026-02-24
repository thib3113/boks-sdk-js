import { describe, test, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { BoksHardwareSimulator, SimulatorTransport, SimulatorStorage } from '../../src/simulator';
import { BoksOpcode, BoksCodeType, BoksOpenSource } from '../../src/protocol/constants';
import { DeleteSingleUseCodePacket } from '../../src/protocol/downlink/DeleteSingleUseCodePacket';
import { OpenDoorPacket } from '../../src/protocol/downlink/OpenDoorPacket';

describe('Boks Hardware Simulator Integrity', () => {
  let simulator: BoksHardwareSimulator;
  let transport: SimulatorTransport;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let responseCallback: Mock<any, any>;

  beforeEach(() => {
    simulator = new BoksHardwareSimulator();
    transport = new SimulatorTransport(simulator);
    responseCallback = vi.fn();
    transport.subscribe(responseCallback);
  });

  afterEach(() => {
    simulator.destroy();
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
    
    // We expect 2 packets: VALID_OPEN_CODE (0x81) and NOTIFY_DOOR_STATUS (0x84)
    await vi.waitFor(() => expect(responseCallback).toHaveBeenCalledTimes(2));
    
    const opcodes = responseCallback.mock.calls.map((c) => c[0][0]);
    expect(opcodes).toContain(BoksOpcode.VALID_OPEN_CODE);
    expect(opcodes).toContain(BoksOpcode.NOTIFY_DOOR_STATUS);
    expect(simulator.getState().isOpen).toBe(true);

    // Check Logs
    const state = simulator.getState();
    // Should log OPEN_DOOR (0x91) as per handleOpenDoor implementation
    // And handleOpenDoor now calls triggerDoorOpen(Ble), so it should also log LOG_CODE_BLE_VALID (0x86)

    // We expect at least 2 logs: 0x86 then 0x91
    expect(state.logs.length).toBeGreaterThanOrEqual(2);
    expect(state.logs[state.logs.length - 2].opcode).toBe(BoksOpcode.LOG_CODE_BLE_VALID);
    expect(state.logs[state.logs.length - 1].opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);

    // Verify code consumption (Single Use)
    expect(simulator.getState().pinCodes.has('123456')).toBe(false);
  });

  test('Should consume Single-Use codes when triggered via simulator', () => {
    simulator.addPinCode('777777', BoksCodeType.Single);
    simulator.triggerDoorOpen(BoksOpenSource.Keypad, '777777');

    expect(simulator.getState().isOpen).toBe(true);
    expect(simulator.getState().pinCodes.has('777777')).toBe(false);
  });

  test('Should NOT consume Multi-Use codes when triggered', () => {
    simulator.addPinCode('888888', BoksCodeType.Multi);
    simulator.triggerDoorOpen(BoksOpenSource.Keypad, '888888');

    expect(simulator.getState().isOpen).toBe(true);
    expect(simulator.getState().pinCodes.has('888888')).toBe(true);
  });

  test('Should handle invalid OPEN_DOOR (0x01)', async () => {
    const packet = new OpenDoorPacket('000000').encode();
    await transport.write(packet);
    await new Promise((r) => setTimeout(r, 10));

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
    await new Promise((r) => setTimeout(r, 10));
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

    // Force Master Key (should update Config Key)
    const testMasterKey = 'AA'.repeat(32); // 64 chars
    simulator.setMasterKey(testMasterKey);
    expect(simulator.getState().configKey).toBe('AAAAAAAA'); // Last 8 chars

    const testMasterKeyBytes = new Uint8Array(32).fill(0xBB);
    simulator.setMasterKey(testMasterKeyBytes);
    expect(simulator.getState().configKey).toBe('BBBBBBBB');

    // FORCE ISOLATION FOR PACKET LOSS TEST
    const isolatedSim = new BoksHardwareSimulator();
    isolatedSim.setProgressDelay(0);
    const isolatedSpy = vi.fn();
    isolatedSim.subscribe(isolatedSpy);
    isolatedSim.setPacketLoss(1.0);
    
    // Actions on isolated simulator
    isolatedSim.setDoorStatus(true);
    const isolatedTransport = new SimulatorTransport(isolatedSim);
    await isolatedTransport.write(new OpenDoorPacket('123456').encode());

    expect(isolatedSpy).not.toHaveBeenCalled();
    isolatedSim.destroy();
  });

  describe('Storage Persistence', () => {
    test('Should load state from storage', () => {
      const mockStorage: SimulatorStorage = {
        get: vi.fn((key) => {
          if (key === 'masterKey') return 'AA'.repeat(32);
          if (key === 'pinCodes') return JSON.stringify([['111111', BoksCodeType.Master]]);
          return null;
        }),
        set: vi.fn()
      };

      const sim = new BoksHardwareSimulator(mockStorage);
      const state = sim.getState();

      expect(state.configKey).toBe('AAAAAAAA');
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

      // Set Master Key
      sim.setMasterKey('BB'.repeat(32));
      expect(mockStorage.set).toHaveBeenCalledWith('masterKey', 'BB'.repeat(32).toUpperCase());
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

  describe('GATT Schema', () => {
    test('Should expose correct GATT Schema structure', () => {
      const schema = simulator.getGattSchema();

      // Verify Boks Service
      const boksService = schema.find(
        (s) => s.uuid === 'a7630001-f491-4f21-95ea-846ba586e361'
      );
      expect(boksService).toBeDefined();

      const writeChar = boksService?.characteristics.find(
        (c) => c.uuid === 'a7630002-f491-4f21-95ea-846ba586e361'
      );
      expect(writeChar).toBeDefined();
      expect(writeChar?.properties).toContain('write');
      expect(writeChar?.properties).toContain('writeWithoutResponse');

      const notifyChar = boksService?.characteristics.find(
        (c) => c.uuid === 'a7630003-f491-4f21-95ea-846ba586e361'
      );
      expect(notifyChar).toBeDefined();
      expect(notifyChar?.properties).toContain('notify');

      // Verify Battery Service
      const batteryService = schema.find(
        (s) => s.uuid === '0000180f-0000-1000-8000-00805f9b34fb'
      );
      expect(batteryService).toBeDefined();

      const batteryChar = batteryService?.characteristics.find(
        (c) => c.uuid === '00002a19-0000-1000-8000-00805f9b34fb'
      );
      expect(batteryChar).toBeDefined();
      expect(batteryChar?.properties).toContain('read');
      expect(batteryChar?.initialValue).toBeInstanceOf(Uint8Array);
    });
  });
});
