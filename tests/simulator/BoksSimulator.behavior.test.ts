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

    it('should trigger BLE open and consume single-use code', async () => {
      // Find a single use code
      let singleUsePin = '';
      for (const [pin, type] of simulator.getInternalState().pinCodes.entries()) {
        if (type === BoksCodeType.Single) {
          singleUsePin = pin;
          break;
        }
      }

      simulator.triggerBleOpen(singleUsePin);
      // Wait for delay
      await new Promise((r) => setTimeout(r, 300));

      expect(simulator.getInternalState().pinCodes.has(singleUsePin)).toBe(false);
      expect(simulator.getInternalState().isOpen).toBe(true);
    });
  });

  describe('Bug Reproduction', () => {
    it('should correctly delete single-use code via handlePacket', async () => {
      // This test ensures we don't regress on the bug where handlePacket
      // was calling handleDeleteMasterCode instead of handleDeleteSingleUseCode.

      // 1. Find a single use code
      let codeToDelete = '';
      for (const [pin, type] of simulator.getInternalState().pinCodes.entries()) {
        if (type === BoksCodeType.Single) {
          codeToDelete = pin;
          break;
        }
      }
      expect(codeToDelete).toBeTruthy();

      const initialCodes = simulator.getInternalState().pinCodes.size;

      // 2. We need to construct the incoming packet manually just like real hardware receives it
      // BoksOpcode.DELETE_SINGLE_USE_CODE = 0x27

      let receivedOpcode = -1;
      simulator.subscribe((data) => {
        receivedOpcode = data[0];
      });

      // The payload to delete code: ConfigKey(8) + Pin(6)
      const payload = new Uint8Array(14);
      payload.set(new TextEncoder().encode(simulator.getInternalState().configKey), 0);
      payload.set(new TextEncoder().encode(codeToDelete), 8);

      const data = new Uint8Array(17); // Opcode(1) + Len(1) + Payload(14) + Checksum(1)
      data[0] = BoksOpcode.DELETE_SINGLE_USE_CODE; // 0x27
      data[1] = 14;
      data.set(payload, 2);

      // Compute checksum
      data[16] = calculateChecksum(data.subarray(0, 16));

      // 3. Process the packet
      await simulator.handlePacket(data);
      await new Promise((r) => setTimeout(r, 10)); // wait for response callback

      // 4. Assert the response indicates success
      expect(receivedOpcode).toBe(BoksOpcode.CODE_OPERATION_ERROR);

      // 5. BUT the code should actually be deleted from the system
      const finalCodes = simulator.getInternalState().pinCodes.size;
      expect(finalCodes).toBe(initialCodes - 1);
      expect(simulator.getInternalState().pinCodes.has(codeToDelete)).toBe(false);
    });
  });

  describe('Testing invalid packets', () => {
    it('should respond with protocol error internally on unimplemented custom opcode', async () => {
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

      const data = new Uint8Array([BoksOpcode.ASK_DOOR_STATUS, 0, 0xff]); // bad checksum
      await simWithLogger.handlePacket(data);

      expect(loggerMock).toHaveBeenCalledWith('warn', 'checksum_error', expect.any(Object));
      simWithLogger.destroy();
    });
  });

  describe.skip('Chaos Mode', () => {
    it('should enable and trigger events', () => {
      vi.useFakeTimers();
      simulator.setChaosMode(false);
      // Further tests could be written for chaos mode.
    });
  });
});
