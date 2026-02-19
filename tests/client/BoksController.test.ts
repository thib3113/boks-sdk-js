import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { BoksController } from '@/client/BoksController';
import { BoksClient } from '@/client/BoksClient';
import {
  BoksOpcode,
  BOKS_UUIDS,
  RegisterNfcTagScanStartPacket,
  CreateMasterCodePacket,
  CreateSingleUseCodePacket,
  CreateMultiUseCodePacket,
  DeleteMasterCodePacket,
  DeleteSingleUseCodePacket,
  DeleteMultiUseCodePacket,
} from '@/protocol';
import { BoksClientErrorId } from '@/errors/BoksClientError';

// Mock the BoksClient module
vi.mock('@/client/BoksClient');

describe('BoksController', () => {
  let controller: BoksController;
  let mockClientInstance: {
    connect: Mock;
    disconnect: Mock;
    readCharacteristic: Mock;
    send: Mock;
    waitForOneOf: Mock;
    waitForPacket: Mock;
    onPacket: Mock;
    fetchHistory: Mock;
  };

  // Valid master key (32 bytes = 64 hex chars) ending in AABBCCDD
  const validMasterKey = '00000000000000000000000000000000000000000000000000000000AABBCCDD';
  const expectedConfigKey = 'AABBCCDD';

  const setupControllerVersion = async (fw: string, sw: string) => {
    const textEncoder = new TextEncoder();
    mockClientInstance.readCharacteristic.mockImplementation(async (uuid: string) => {
      if (uuid === BOKS_UUIDS.SOFTWARE_REVISION) return textEncoder.encode(sw);
      if (uuid === BOKS_UUIDS.FIRMWARE_REVISION) return textEncoder.encode(fw);
      throw new Error('Unknown UUID');
    });
    await controller.connect();
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the methods we expect on the client instance
    mockClientInstance = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      readCharacteristic: vi.fn(),
      send: vi.fn().mockResolvedValue(undefined),
      waitForOneOf: vi.fn(),
      waitForPacket: vi.fn(),
      onPacket: vi.fn(),
      fetchHistory: vi.fn(),
    };

    // Make the mocked class constructor return our mock instance
    (BoksClient as unknown as Mock).mockReturnValue(mockClientInstance);

    // Create the controller with a new client instance
    const client = new BoksClient();
    controller = new BoksController(client);
  });

  describe('connect & hardwareInfo', () => {
    it('should connect and derive hardware info (HW 4.0)', async () => {
      await setupControllerVersion('10/125', '4.3.3');

      expect(mockClientInstance.connect).toHaveBeenCalled();
      expect(mockClientInstance.readCharacteristic).toHaveBeenCalledWith(BOKS_UUIDS.SOFTWARE_REVISION);
      expect(mockClientInstance.readCharacteristic).toHaveBeenCalledWith(BOKS_UUIDS.FIRMWARE_REVISION);

      const hwInfo = controller.hardwareInfo;
      expect(hwInfo).toEqual({
        firmwareRevision: '10/125',
        softwareRevision: '4.3.3',
        hardwareVersion: '4.0',
        chipset: 'nRF52833'
      });
    });

    it('should connect and derive hardware info (HW 3.0)', async () => {
      await setupControllerVersion('10/cd', '4.2.0');

      expect(controller.hardwareInfo).toEqual({
        firmwareRevision: '10/cd',
        softwareRevision: '4.2.0',
        hardwareVersion: '3.0',
        chipset: 'nRF52811'
      });
    });

    it('should connect and handle unknown hardware', async () => {
      await setupControllerVersion('unknown', '1.0.0');

      expect(controller.hardwareInfo).toEqual({
        firmwareRevision: 'unknown',
        softwareRevision: '1.0.0',
        hardwareVersion: 'Unknown',
        chipset: 'Unknown'
      });
    });

    it('disconnect should call client disconnect', async () => {
      await controller.disconnect();
      expect(mockClientInstance.disconnect).toHaveBeenCalled();
    });
  });

  describe('setCredentials', () => {
    it('should throw if master key is invalid length', () => {
      expect(() => controller.setCredentials('ABC')).toThrowError(expect.objectContaining({ id: BoksClientErrorId.INVALID_PARAMETER }));
    });

    it('should derive config key correctly', () => {
      // Internal state is private, but we can verify it via actions that use it
      // Like createMasterCode
      controller.setCredentials(validMasterKey);
      // Logic verified in downstream tests
    });
  });

  describe('Business Methods', () => {
    beforeEach(() => {
      controller.setCredentials(validMasterKey);
    });

    describe('openDoor', () => {
      it('should open door successfully', async () => {
        mockClientInstance.waitForOneOf.mockResolvedValue({ opcode: BoksOpcode.VALID_OPEN_CODE });
        const result = await controller.openDoor('123456');
        expect(mockClientInstance.send).toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('should return false on invalid code', async () => {
        mockClientInstance.waitForOneOf.mockResolvedValue({ opcode: BoksOpcode.INVALID_OPEN_CODE });
        const result = await controller.openDoor('000000');
        expect(result).toBe(false);
      });
    });

    describe('getDoorStatus', () => {
      it('should return true if open', async () => {
        mockClientInstance.waitForOneOf.mockResolvedValue({ isOpen: true, opcode: BoksOpcode.ANSWER_DOOR_STATUS });
        const result = await controller.getDoorStatus();
        expect(result).toBe(true);
      });

      it('should return false if closed', async () => {
        mockClientInstance.waitForOneOf.mockResolvedValue({ isOpen: false, opcode: BoksOpcode.ANSWER_DOOR_STATUS });
        const result = await controller.getDoorStatus();
        expect(result).toBe(false);
      });
    });

    describe('getLogsCount', () => {
      it('should return logs count', async () => {
        mockClientInstance.waitForPacket.mockResolvedValue({ count: 42, opcode: BoksOpcode.NOTIFY_LOGS_COUNT });
        const result = await controller.getLogsCount();
        expect(result).toBe(42);
      });
    });

    describe('testBattery', () => {
      it('should send test battery command', async () => {
        await controller.testBattery();
        expect(mockClientInstance.send).toHaveBeenCalled();
      });
    });

    describe('reboot', () => {
      it('should send reboot command', async () => {
        await controller.reboot();
        expect(mockClientInstance.send).toHaveBeenCalled();
      });
    });

    describe('fetchHistory', () => {
      it('should delegate to client', async () => {
        const mockHistory = [{ type: 'open' }];
        mockClientInstance.fetchHistory.mockResolvedValue(mockHistory);
        const result = await controller.fetchHistory(100);
        expect(mockClientInstance.fetchHistory).toHaveBeenCalledWith(100);
        expect(result).toEqual(mockHistory);
      });
    });

    describe('Code Management', () => {
      // Helper for success/error
      const setupSuccess = () => mockClientInstance.waitForOneOf.mockResolvedValue({ opcode: BoksOpcode.CODE_OPERATION_SUCCESS });
      const setupError = () => mockClientInstance.waitForOneOf.mockResolvedValue({ opcode: BoksOpcode.CODE_OPERATION_ERROR });

      describe('createMasterCode', () => {
        it('should create master code', async () => {
          setupSuccess();
          const result = await controller.createMasterCode(1, '123456');
          expect(result).toBe(true);
          const packet = mockClientInstance.send.mock.calls[0][0];
          expect(packet).toBeInstanceOf(CreateMasterCodePacket);
          expect(packet.configKey).toBe(expectedConfigKey);
        });

        it('should return false on error', async () => {
          setupError();
          const result = await controller.createMasterCode(1, '123456');
          expect(result).toBe(false);
        });
      });

      describe('createSingleUseCode', () => {
        it('should create single use code', async () => {
          setupSuccess();
          const result = await controller.createSingleUseCode('123456');
          expect(result).toBe(true);
          const packet = mockClientInstance.send.mock.calls[0][0];
          expect(packet).toBeInstanceOf(CreateSingleUseCodePacket);
          expect(packet.configKey).toBe(expectedConfigKey);
        });
      });

      describe('createMultiUseCode', () => {
        it('should create multi use code', async () => {
          setupSuccess();
          const result = await controller.createMultiUseCode('123456');
          expect(result).toBe(true);
          const packet = mockClientInstance.send.mock.calls[0][0];
          expect(packet).toBeInstanceOf(CreateMultiUseCodePacket);
          expect(packet.configKey).toBe(expectedConfigKey);
        });
      });

      describe('deleteMasterCode', () => {
        it('should delete master code', async () => {
          setupSuccess();
          const result = await controller.deleteMasterCode(1);
          expect(result).toBe(true);
          const packet = mockClientInstance.send.mock.calls[0][0];
          expect(packet).toBeInstanceOf(DeleteMasterCodePacket);
          expect(packet.configKey).toBe(expectedConfigKey);
        });
      });

      describe('deleteSingleUseCode', () => {
        it('should delete single use code', async () => {
          setupSuccess();
          const result = await controller.deleteSingleUseCode('123456');
          expect(result).toBe(true);
          const packet = mockClientInstance.send.mock.calls[0][0];
          expect(packet).toBeInstanceOf(DeleteSingleUseCodePacket);
          expect(packet.configKey).toBe(expectedConfigKey);
        });
      });

      describe('deleteMultiUseCode', () => {
        it('should delete multi use code', async () => {
          setupSuccess();
          const result = await controller.deleteMultiUseCode('123456');
          expect(result).toBe(true);
          const packet = mockClientInstance.send.mock.calls[0][0];
          expect(packet).toBeInstanceOf(DeleteMultiUseCodePacket);
          expect(packet.configKey).toBe(expectedConfigKey);
        });
      });
    });
  });

  describe('NFC Features (Version Restricted)', () => {
    describe('scanNFCTags', () => {
      it('should throw INVALID_PARAMETER if credentials not set', async () => {
        // New instance without credentials
        const c2 = new BoksController(new BoksClient());
        await expect(c2.scanNFCTags())
            .rejects
            .toThrowError(expect.objectContaining({ id: BoksClientErrorId.INVALID_PARAMETER }));
      });

      it('should throw UNKNOWN_ERROR if not connected', async () => {
        controller.setCredentials(validMasterKey);
        await expect(controller.scanNFCTags())
            .rejects
            .toThrowError(expect.objectContaining({ id: BoksClientErrorId.UNKNOWN_ERROR }));
      });

      it('should throw UNSUPPORTED_FEATURE if Hardware Version < 4.0', async () => {
        controller.setCredentials(validMasterKey);
        await setupControllerVersion('10/cd', '4.3.3'); // HW 3.0
        await expect(controller.scanNFCTags())
            .rejects
            .toThrowError(expect.objectContaining({
                id: BoksClientErrorId.UNSUPPORTED_FEATURE,
                message: expect.stringContaining('Hardware Version 4.0')
            }));
      });

      it('should throw UNSUPPORTED_FEATURE if Software Version < 4.3.3', async () => {
        controller.setCredentials(validMasterKey);
        await setupControllerVersion('10/125', '4.3.0'); // SW 4.3.0
        await expect(controller.scanNFCTags())
            .rejects
            .toThrowError(expect.objectContaining({
                id: BoksClientErrorId.UNSUPPORTED_FEATURE,
                message: expect.stringContaining('Software Version >= 4.3.3')
            }));
      });

      it('should send scan packet and wait for result', async () => {
        controller.setCredentials(validMasterKey);
        await setupControllerVersion('10/125', '4.3.3');

        const mockResultPacket = { opcode: BoksOpcode.NOTIFY_NFC_TAG_FOUND };
        mockClientInstance.waitForOneOf.mockResolvedValue(mockResultPacket);

        const result = await controller.scanNFCTags(5000);

        expect(mockClientInstance.send).toHaveBeenCalledTimes(1);
        const sentPacket = mockClientInstance.send.mock.calls[0][0];
        expect(sentPacket).toBeInstanceOf(RegisterNfcTagScanStartPacket);
        expect(sentPacket.configKey).toBe(expectedConfigKey);

        expect(mockClientInstance.waitForOneOf).toHaveBeenCalledWith(
            [
                BoksOpcode.NOTIFY_NFC_TAG_FOUND,
                BoksOpcode.ERROR_NFC_SCAN_TIMEOUT,
                BoksOpcode.ERROR_NFC_TAG_ALREADY_EXISTS_SCAN
            ],
            5000
        );
        expect(result).toBe(mockResultPacket);
      });
    });

    describe('registerNfcTag', () => {
      const tagId = '01:02:03:04';

      it('should register NFC tag successfully', async () => {
        controller.setCredentials(validMasterKey);
        await setupControllerVersion('10/125', '4.3.3');
        mockClientInstance.waitForOneOf.mockResolvedValue({ opcode: BoksOpcode.NOTIFY_NFC_TAG_REGISTERED });

        const result = await controller.registerNfcTag(tagId);

        expect(mockClientInstance.send).toHaveBeenCalledTimes(1);
        expect(mockClientInstance.waitForOneOf).toHaveBeenCalledWith(
            [
                BoksOpcode.NOTIFY_NFC_TAG_REGISTERED,
                BoksOpcode.NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS
            ]
        );
        expect(result).toBe(true);
      });

      it('should return false if NFC tag already exists', async () => {
        controller.setCredentials(validMasterKey);
        await setupControllerVersion('10/125', '4.3.3');
        mockClientInstance.waitForOneOf.mockResolvedValue({ opcode: BoksOpcode.NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS });

        const result = await controller.registerNfcTag(tagId);
        expect(result).toBe(false);
      });
    });

    describe('unregisterNfcTag', () => {
      const tagId = '01:02:03:04';

      it('should unregister NFC tag successfully', async () => {
        controller.setCredentials(validMasterKey);
        await setupControllerVersion('10/125', '4.3.3');
        mockClientInstance.waitForPacket.mockResolvedValue({ opcode: BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED });

        const result = await controller.unregisterNfcTag(tagId);

        expect(mockClientInstance.send).toHaveBeenCalledTimes(1);
        expect(mockClientInstance.waitForPacket).toHaveBeenCalledWith(BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED);
        expect(result).toBe(true);
      });
    });
  });

  describe('regenerateMasterKey', () => {
    const newKeyHex = '00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF';

    it('should regenerate master key successfully', async () => {
      controller.setCredentials(validMasterKey);
      const onProgress = vi.fn();

      mockClientInstance.onPacket.mockImplementation((callback: any) => {
          setTimeout(() => {
              callback({ opcode: BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS, progress: 50 });
              setTimeout(() => {
                  callback({ opcode: BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS });
              }, 10);
          }, 10);
          return vi.fn();
      });

      const result = await controller.regenerateMasterKey(newKeyHex, onProgress);

      expect(result).toBe(true);
      expect(mockClientInstance.send).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it('should handle regeneration failure', async () => {
      controller.setCredentials(validMasterKey);
      mockClientInstance.onPacket.mockImplementation((callback: any) => {
          setTimeout(() => {
              callback({ opcode: BoksOpcode.NOTIFY_CODE_GENERATION_ERROR });
          }, 10);
          return vi.fn();
      });

      const result = await controller.regenerateMasterKey(newKeyHex);
      expect(result).toBe(false);
    });
  });
});
