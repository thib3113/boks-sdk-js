import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { BoksController } from '@/client/BoksController';
import { BoksClient } from '@/client/BoksClient';
import {
  BoksOpcode,
  BOKS_UUIDS,
  RegisterNfcTagScanStartPacket,
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
  };

  // Valid master key (32 bytes = 64 hex chars) ending in AABBCCDD
  const validMasterKey = '00000000000000000000000000000000000000000000000000000000AABBCCDD';
  const expectedConfigKey = 'AABBCCDD';

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
    };

    // Make the mocked class constructor return our mock instance
    (BoksClient as unknown as Mock).mockReturnValue(mockClientInstance);

    // Create the controller with a new client instance
    const client = new BoksClient();
    controller = new BoksController(client);
  });

  describe('connect & hardwareInfo', () => {
    it('should connect and derive hardware info (HW 4.0)', async () => {
      const textEncoder = new TextEncoder();

      mockClientInstance.readCharacteristic.mockImplementation(async (uuid: string) => {
        if (uuid === BOKS_UUIDS.SOFTWARE_REVISION) return textEncoder.encode('4.3.3\0');
        if (uuid === BOKS_UUIDS.FIRMWARE_REVISION) return textEncoder.encode('10/125\0');
        throw new Error('Unknown UUID');
      });

      await controller.connect();

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
      const textEncoder = new TextEncoder();
      mockClientInstance.readCharacteristic.mockImplementation(async (uuid: string) => {
        if (uuid === BOKS_UUIDS.SOFTWARE_REVISION) return textEncoder.encode('4.2.0');
        if (uuid === BOKS_UUIDS.FIRMWARE_REVISION) return textEncoder.encode('10/cd');
        throw new Error('Unknown UUID');
      });

      await controller.connect();

      expect(controller.hardwareInfo).toEqual({
        firmwareRevision: '10/cd',
        softwareRevision: '4.2.0',
        hardwareVersion: '3.0',
        chipset: 'nRF52811'
      });
    });

    it('should connect and handle unknown hardware', async () => {
      const textEncoder = new TextEncoder();
      mockClientInstance.readCharacteristic.mockImplementation(async (uuid: string) => {
        if (uuid === BOKS_UUIDS.SOFTWARE_REVISION) return textEncoder.encode('1.0.0');
        if (uuid === BOKS_UUIDS.FIRMWARE_REVISION) return textEncoder.encode('unknown');
        throw new Error('Unknown UUID');
      });

      await controller.connect();

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

  describe('scanNFCTags', () => {
    const setupControllerVersion = async (fw: string, sw: string) => {
        const textEncoder = new TextEncoder();
        mockClientInstance.readCharacteristic.mockImplementation(async (uuid: string) => {
            if (uuid === BOKS_UUIDS.SOFTWARE_REVISION) return textEncoder.encode(sw);
            if (uuid === BOKS_UUIDS.FIRMWARE_REVISION) return textEncoder.encode(fw);
            throw new Error('Unknown UUID');
        });
        await controller.connect();
    };

    it('should throw INVALID_PARAMETER if credentials not set', async () => {
        // Do not set credentials
        await expect(controller.scanNFCTags())
            .rejects
            .toThrowError(expect.objectContaining({ id: BoksClientErrorId.INVALID_PARAMETER }));
    });

    it('should throw UNKNOWN_ERROR if not connected (no hardware info)', async () => {
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

    it('should send scan packet and wait for result if requirements met', async () => {
        controller.setCredentials(validMasterKey);
        await setupControllerVersion('10/125', '4.3.3');

        const mockResultPacket = { opcode: BoksOpcode.NOTIFY_NFC_TAG_FOUND };
        mockClientInstance.waitForOneOf.mockResolvedValue(mockResultPacket);

        const result = await controller.scanNFCTags(5000);

        expect(mockClientInstance.send).toHaveBeenCalledTimes(1);
        const sentPacket = mockClientInstance.send.mock.calls[0][0] as RegisterNfcTagScanStartPacket;
        expect(sentPacket).toBeInstanceOf(RegisterNfcTagScanStartPacket);

        // Strict check: verify config key was passed correctly
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

    it('should pass default timeout if not provided', async () => {
        controller.setCredentials(validMasterKey);
        await setupControllerVersion('10/125', '4.3.3');
        mockClientInstance.waitForOneOf.mockResolvedValue({});

        await controller.scanNFCTags();

        expect(mockClientInstance.waitForOneOf).toHaveBeenCalledWith(expect.any(Array), 10000);
    });
  });

  describe('registerNfcTag', () => {
    const tagId = '01:02:03:04';

    const setupControllerVersion = async (fw: string, sw: string) => {
        const textEncoder = new TextEncoder();
        mockClientInstance.readCharacteristic.mockImplementation(async (uuid: string) => {
            if (uuid === BOKS_UUIDS.SOFTWARE_REVISION) return textEncoder.encode(sw);
            if (uuid === BOKS_UUIDS.FIRMWARE_REVISION) return textEncoder.encode(fw);
            throw new Error('Unknown UUID');
        });
        await controller.connect();
    };

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

    const setupControllerVersion = async (fw: string, sw: string) => {
        const textEncoder = new TextEncoder();
        mockClientInstance.readCharacteristic.mockImplementation(async (uuid: string) => {
            if (uuid === BOKS_UUIDS.SOFTWARE_REVISION) return textEncoder.encode(sw);
            if (uuid === BOKS_UUIDS.FIRMWARE_REVISION) return textEncoder.encode(fw);
            throw new Error('Unknown UUID');
        });
        await controller.connect();
    };

    it('should unregister NFC tag successfully', async () => {
        controller.setCredentials(validMasterKey);
        await setupControllerVersion('10/125', '4.3.3');

        mockClientInstance.waitForPacket.mockResolvedValue({ opcode: BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED });

        const result = await controller.unregisterNfcTag(tagId);

        expect(mockClientInstance.send).toHaveBeenCalledTimes(1);
        expect(mockClientInstance.waitForPacket).toHaveBeenCalledWith(
          BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED
        );
        expect(result).toBe(true);
    });
  });

  describe('regenerateMasterKey', () => {
    // Current master key needs to be set
    const newKeyHex = '00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF';

    it('should regenerate master key successfully', async () => {
      controller.setCredentials(validMasterKey);
      const onProgress = vi.fn();

      // Mock onPacket to simulate progress and success
      mockClientInstance.onPacket.mockImplementation((callback: any) => {
          setTimeout(() => {
              callback({ opcode: BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS, progress: 50 });
              setTimeout(() => {
                  callback({ opcode: BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS });
              }, 10);
          }, 10);
          return vi.fn(); // cleanup
      });

      const result = await controller.regenerateMasterKey(newKeyHex, onProgress);

      expect(result).toBe(true);
      expect(mockClientInstance.send).toHaveBeenCalledTimes(2); // Part A and Part B
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
