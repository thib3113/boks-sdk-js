import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { BoksController } from '@/client/BoksController';
import { BoksClient } from '@/client/BoksClient';
import {
  BoksOpcode,
  BoksCodeType,
  BOKS_UUIDS,
  CreateSingleUseCodePacket
} from '@/protocol';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';

// Mock BoksClient
vi.mock('@/client/BoksClient');

describe('BoksController', () => {
  let controller: BoksController;
  let mockClientInstance: any;

  const validMasterKey = '00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF';

  beforeEach(() => {
    vi.clearAllMocks();
    mockClientInstance = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      readCharacteristic: vi.fn().mockResolvedValue(new Uint8Array([0])),
      onPacket: vi.fn().mockReturnValue(() => {}),
      execute: vi.fn(),
      getBatteryLevel: vi.fn().mockResolvedValue(100),
      getBatteryStats: vi.fn().mockResolvedValue({ voltage: 6000, current: 100, temperature: 25 }),
      fetchHistory: vi.fn().mockResolvedValue([])
    };

    (BoksClient as unknown as Mock).mockReturnValue(mockClientInstance);
    controller = new BoksController(new BoksClient());
  });

  const setupSuccess = (response: any = { opcode: BoksOpcode.CODE_OPERATION_SUCCESS }) => 
    mockClientInstance.execute.mockResolvedValue({ 
      isSuccess: true, 
      response,
      status: 'success'
    });

  const setupError = (error: Error = new BoksClientError(BoksClientErrorId.UNKNOWN_ERROR, 'Operation failed')) => 
    mockClientInstance.execute.mockResolvedValue({ 
      isSuccess: false, 
      error,
      status: 'error'
    });

  async function setupControllerVersion(fw: string, sw: string) {
    const encoder = new TextEncoder();
    mockClientInstance.readCharacteristic.mockImplementation((uuid: string) => {
      if (uuid === BOKS_UUIDS.FIRMWARE_REVISION) return Promise.resolve(encoder.encode(fw));
      if (uuid === BOKS_UUIDS.SOFTWARE_REVISION) return Promise.resolve(encoder.encode(sw));
      return Promise.resolve(new Uint8Array([0]));
    });
    await controller.connect();
  }

  describe('connect & hardwareInfo', () => {
    it('should connect and derive hardware info (HW 4.0)', async () => {
      await setupControllerVersion('10/125', '4.3.3');
      expect(mockClientInstance.connect).toHaveBeenCalled();
      expect(controller.hardwareInfo?.hardwareVersion).toBe('4.0');
    });

    it('should accept 4-byte config key and clear master key', async () => {
      const configKey = 'AABBCCDD';
      controller.setCredentials(configKey);

      // Verify that operations requiring config key still work
      setupSuccess();
      const result = await controller.createSingleUseCode('123456');
      expect(result).toBe(true);
      
      const [packet] = mockClientInstance.execute.mock.calls[0];
      expect(packet).toBeInstanceOf(CreateSingleUseCodePacket);
      expect(packet.configKey).toBe(configKey);

      // Verify master key is null via getter
      expect(controller.masterKey).toBeNull();
    });
  });

  describe('Business Methods', () => {
    beforeEach(() => {
      controller.setCredentials(validMasterKey);
    });

    describe('openDoor', () => {
      it('should open door successfully', async () => {
        setupSuccess({ opcode: BoksOpcode.VALID_OPEN_CODE });
        const result = await controller.openDoor('123456');
        expect(result).toBe(true);
      });

      it('should return false on invalid code', async () => {
        setupError(new BoksClientError(BoksClientErrorId.UNKNOWN_ERROR, 'Invalid PIN'));
        const result = await controller.openDoor('000000');
        expect(result).toBe(false);
      });
    });

    describe('getDoorStatus', () => {
      it('should return door status', async () => {
        setupSuccess({ isOpen: true, opcode: BoksOpcode.ANSWER_DOOR_STATUS });
        expect(await controller.getDoorStatus()).toBe(true);
      });
    });

    describe('Log & Code counts', () => {
      it('should return logs count', async () => {
        setupSuccess({ count: 42, opcode: BoksOpcode.NOTIFY_LOGS_COUNT });
        expect(await controller.getLogsCount()).toBe(42);
      });

      it('should return codes count', async () => {
        setupSuccess({ masterCount: 5, otherCount: 10, opcode: BoksOpcode.NOTIFY_CODES_COUNT });
        const counts = await controller.countCodes();
        expect(counts).toEqual({ masterCount: 5, singleCount: 10 });
      });
    });

    describe('Code Management', () => {
      it('should create master code', async () => {
        setupSuccess();
        expect(await controller.createMasterCode(1, '123456')).toBe(true);
      });

      it('should create single use code', async () => {
        setupSuccess();
        expect(await controller.createSingleUseCode('123456')).toBe(true);
      });

      it('should delete master code', async () => {
        setupSuccess();
        expect(await controller.deleteMasterCode(1)).toBe(true);
      });
    });

    describe('Advanced Features', () => {
      it('should reactivate code', async () => {
        setupSuccess();
        expect(await controller.reactivateCode('123456')).toBe(true);
      });

      it('should edit master code', async () => {
        setupSuccess();
        expect(await controller.editMasterCode(1, '654321')).toBe(true);
      });

      it('should set configuration', async () => {
        setupSuccess({ opcode: BoksOpcode.NOTIFY_SET_CONFIGURATION_SUCCESS });
        expect(await controller.setConfiguration({ type: 1, value: true })).toBe(true);
      });

      it('should convert code type', async () => {
        setupSuccess();
        expect(await controller.convertCodeType('123456', BoksCodeType.Multi)).toBe(true);
      });
    });
  });
});
