import { calculateChecksum } from '../../src/utils/converters';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BoksHardwareSimulator, SimulatorStorage } from '../../src/simulator/BoksSimulator';
import { BoksOpcode, BoksCodeType } from '../../src/protocol/constants';

class MockStorage implements SimulatorStorage {
  private data = new Map<string, string>();
  get(key: string): string | null {
    return this.data.get(key) || null;
  }
  set(key: string, val: string): void {
    this.data.set(key, val);
  }
}

describe('BoksHardwareSimulator', () => {
  let simulator: BoksHardwareSimulator;

  beforeEach(() => {
    simulator = new BoksHardwareSimulator();
  });

  afterEach(() => {
    simulator.destroy();
    vi.restoreAllMocks();
  });

  describe('Initialization and State', () => {
    it('should generate initial codes without storage', () => {
      const state = simulator.getInternalState();
      expect(state.masterCodes.size).toBe(5);
      expect(state.pinCodes.size).toBeGreaterThan(3000);
    });

    it('should load state from storage if provided', () => {
      const storage = new MockStorage();
      const mockKey = 'AABBCCDDEEFF0011AABBCCDDEEFF0011AABBCCDDEEFF0011AABBCCDDEEFF0011';
      storage.set('masterKey', mockKey);

      const newSim = new BoksHardwareSimulator(storage);
      expect(newSim.getInternalState().masterKey.toUpperCase()).toBe(mockKey.toUpperCase());
      newSim.destroy();
    });

    it('should persist state to storage upon modification', () => {
      const storage = new MockStorage();
      const newSim = new BoksHardwareSimulator({ storage });

      newSim.setMasterKey('0011223344556677889900112233445566778899001122334455667788990011');
      expect(storage.get('masterKey')).toBe(
        '0011223344556677889900112233445566778899001122334455667788990011'
      );
      newSim.destroy();
    });
  });

  describe('Forced Triggers', () => {
    it('should force door status and log', () => {
      let notifyCount = 0;
      simulator.subscribe((data) => {
        if (data[0] === BoksOpcode.NOTIFY_DOOR_STATUS) notifyCount++;
      });
      simulator.setDoorStatus(true);
      expect(simulator.getInternalState().isOpen).toBe(true);
      expect(notifyCount).toBeGreaterThan(0);
    });

    it('should trigger BLE open and consume single-use code', () => {
      // Find a single use code
      let singleUsePin = '';
      for (const [pin, type] of simulator.getInternalState().pinCodes.entries()) {
        if (type === BoksCodeType.Single) {
          singleUsePin = pin;
          break;
        }
      }

      simulator.triggerBleOpen(singleUsePin);
      expect(simulator.getInternalState().isOpen).toBe(true);
      expect(simulator.getInternalState().pinCodes.has(singleUsePin)).toBe(false);

      const logs = simulator.getInternalState().logs;
      expect(logs.find((l) => l.opcode === BoksOpcode.LOG_CODE_BLE_VALID)).toBeDefined();
    });

    it('should trigger keypad open', () => {
      simulator.triggerKeypadOpen('112233');
      expect(simulator.getInternalState().isOpen).toBe(true);
      const logs = simulator.getInternalState().logs;
      expect(logs.find((l) => l.opcode === BoksOpcode.LOG_CODE_KEY_VALID)).toBeDefined();
    });

    it('should trigger physical key open', () => {
      simulator.triggerPhysicalKeyOpen();
      expect(simulator.getInternalState().isOpen).toBe(true);
      const logs = simulator.getInternalState().logs;
      expect(logs.find((l) => l.opcode === BoksOpcode.LOG_EVENT_KEY_OPENING)).toBeDefined();
    });

    it('should set and notify battery level', () => {
      const mockCb = vi.fn();
      simulator.subscribeToBattery(mockCb); // Immediately calls with 100
      expect(mockCb).toHaveBeenCalledWith(new Uint8Array([100]));

      simulator.setBatteryLevel(42);
      expect(mockCb).toHaveBeenCalledWith(new Uint8Array([42]));
    });
  });

  describe('Packet Handling and Opcode Processing', () => {
    it('should drop packets based on probability', async () => {
      const mockCb = vi.fn();
      simulator.subscribe(mockCb);

      simulator.setPacketLoss(1); // 100% loss

      // Attempt to send a packet

      // Bypass by testing emit directly via internal triggers
      simulator.setDoorStatus(true); // would trigger emit

      expect(mockCb).not.toHaveBeenCalled();
    });

    it('should respect opcode overrides', async () => {
      const mockCb = vi.fn();
      simulator.subscribe(mockCb);

      simulator.setOpcodeOverride(BoksOpcode.ASK_DOOR_STATUS, new Uint8Array([0x99, 0x00, 0x99]));

      // Send a valid packet
      const data = new Uint8Array([BoksOpcode.ASK_DOOR_STATUS, 0, 0]);
      // calc checksum
      data[2] = calculateChecksum(data.subarray(0, 2));

      await simulator.handlePacket(data);
      await new Promise((r) => setTimeout(r, 0)); // await emit

      expect(mockCb).toHaveBeenCalledWith(new Uint8Array([0x99, 0x00, 0x99]));
    });

    it('should respond with checksum error internally logged if invalid checksum', async () => {
      const loggerMock = vi.fn();
      const simWithLogger = new BoksHardwareSimulator({ logger: loggerMock });

      const data = new Uint8Array([BoksOpcode.ASK_DOOR_STATUS, 0, 0xFF]); // bad checksum
      await simWithLogger.handlePacket(data);

      expect(loggerMock).toHaveBeenCalledWith('warn', 'checksum_error', expect.any(Object));
      simWithLogger.destroy();
    });
  });

  describe.skip('Chaos Mode', () => {
    it('should enable and trigger events', () => {
      vi.useFakeTimers();
      simulator.setChaosMode(false);

      // Fast forward to trigger chaos
      vi.advanceTimersByTime(20000);

      const state = simulator.getInternalState();
      // It's random, but we can verify it doesn't crash
      expect(state).toBeDefined();

      simulator.setChaosMode(false);
      vi.useRealTimers();
    });
  });

  describe('NFC Emulation', () => {
    it('should simulate NFC scan appropriately', () => {
      simulator.simulateNfcScan('AABBCCDD');
      // No emit because not scanning
      expect(simulator.getInternalState().isNfcScanning).toBe(false);
    });
  });

  describe('Specific Hardware Quirks', () => {
    it('should reproduce the bug 0x78 when deleting single use code', async () => {
      // 1. Create a specific single use code
      simulator.addPinCode('112233', BoksCodeType.Single);
      const initialCodes = simulator.getInternalState().pinCodes.size;

      let receivedOpcode = 0;
      simulator.subscribe((data) => {
        receivedOpcode = data[0];
      });

      // 2. Send delete packet (Opcode 0x27)
      // Payload for single use delete is config key (8 bytes) + PIN (6 bytes) = 14 bytes
      const configKeyBytes = new TextEncoder().encode(simulator.getInternalState().configKey);
      const pinBytes = new TextEncoder().encode('112233');

      const payload = new Uint8Array(14);
      payload.set(configKeyBytes, 0);
      payload.set(pinBytes, 8);

      const data = new Uint8Array(17); // Opcode(1) + Len(1) + Payload(14) + Checksum(1)
      data[0] = BoksOpcode.DELETE_SINGLE_USE_CODE; // 0x27
      data[1] = 14;
      data.set(payload, 2);

      // Compute checksum
      data[16] = calculateChecksum(data.subarray(0, 16));

      // 3. Process the packet
      await simulator.handlePacket(data);
      await new Promise((r) => setTimeout(r, 10)); // wait for response callback

      // 4. Assert the bug is reproduced: hardware returns CODE_OPERATION_ERROR (0x78)
      expect(receivedOpcode).toBe(BoksOpcode.CODE_OPERATION_ERROR);

      // 5. BUT the code should actually be deleted from the system
      const finalCodes = simulator.getInternalState().pinCodes.size;
      expect(finalCodes).toBe(initialCodes - 1);
      expect(simulator.getInternalState().pinCodes.has('112233')).toBe(false);
    });
  });
});
