import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import fc from 'fast-check';
import { BoksController } from '@/client/BoksController';
import { BoksClient } from '@/client/BoksClient';
import { BOKS_UUIDS } from '@/protocol';
import { BoksClientError } from '@/errors/BoksClientError';

// Mock BoksClient
vi.mock('@/client/BoksClient');

describe('BoksController Resilience (Fuzzing)', () => {
  let controller: BoksController;
  let mockClientInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClientInstance = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      readCharacteristic: vi.fn().mockResolvedValue(new Uint8Array([0])),
      on: vi.fn().mockReturnValue(() => {}),
      execute: vi.fn(),
      getBatteryLevel: vi.fn().mockResolvedValue(100),
      getBatteryStats: vi.fn().mockResolvedValue({ voltage: 6000, current: 100, temperature: 25 }),
      fetchHistory: vi.fn().mockResolvedValue([])
    };

    (BoksClient as unknown as Mock).mockImplementation(function () {
      return mockClientInstance;
    });
    controller = new BoksController(new BoksClient());
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

  describe('deriveHardwareInfo & checkRequirements Resilience', () => {
    it('should safely parse arbitrary firmware and software revisions without throwing', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), fc.string(), async (fw, sw) => {
          await setupControllerVersion(fw, sw);
          const hwInfo = controller.hardwareInfo;
          expect(hwInfo).toBeDefined();
          expect(hwInfo?.firmwareRevision).toBe(fw.trim());
          expect(hwInfo?.softwareRevision).toBe(sw.trim());
          // Hardware version/chipset are fallback logic, just check they are strings
          expect(typeof hwInfo?.hardwareVersion).toBe('string');
          expect(typeof hwInfo?.chipset).toBe('string');
        }),
        { numRuns: 100 }
      );
    });

    it('should safely compare SemVer via checkRequirements on arbitrary strings', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), fc.string(), async (currentSw, requiredSw) => {
          await setupControllerVersion('10/125', currentSw);
          controller.setCredentials('00000000'); // set config key so we can call NFC scan

          // checkRequirements is private, so we test it via scanNFCTags which triggers it.
          // scanNFCTags requires 4.0 HW and 4.3.3 SW
          // If we override the logic via a cast to expose checkRequirements, we can test it purely
          try {
            (controller as any).checkRequirements({ minSw: requiredSw, featureName: 'Fuzz' });
            // If it succeeds, the SemVer comparison didn't throw an error
          } catch (e: any) {
            // It should only throw a BoksClientError if the version check failed
            expect(e).toBeInstanceOf(BoksClientError);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('setCredentials Resilience', () => {
    it('should correctly set 64-char hex string as Master Key and derive Config Key', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 32, maxLength: 32 }).map((arr) =>
            Array.from(arr)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')
          ),
          (hexKey) => {
            controller.setCredentials(hexKey);
            expect(controller.masterKey).toBe(hexKey.toUpperCase());
            const configKeyStr = (controller as any).getConfigKeyOrThrow();
            expect(configKeyStr).toBe(hexKey.toUpperCase().slice(-8));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly set 8-char hex string as Config Key and nullify Master Key', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 4, maxLength: 4 }).map((arr) =>
            Array.from(arr)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')
          ),
          (hexKey) => {
            controller.setCredentials(hexKey);
            expect(controller.masterKey).toBeNull();
            expect((controller as any).getConfigKeyOrThrow()).toBe(hexKey.toUpperCase());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly set 32-byte Uint8Array as Master Key and derive Config Key', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 32, maxLength: 32 }), (keyBytes) => {
          controller.setCredentials(keyBytes);
          // Master Key should be exactly 64 chars
          expect(controller.masterKey?.length).toBe(64);
          expect((controller as any).getConfigKeyOrThrow().length).toBe(8);
          expect((controller as any).getConfigKeyOrThrow()).toBe(controller.masterKey?.slice(-8));
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly set 4-byte Uint8Array as Config Key and nullify Master Key', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 4, maxLength: 4 }), (keyBytes) => {
          controller.setCredentials(keyBytes);
          expect(controller.masterKey).toBeNull();
          expect((controller as any).getConfigKeyOrThrow().length).toBe(8);
        }),
        { numRuns: 100 }
      );
    });

    it('should throw validation error on invalid lengths (string)', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => s.length !== 8 && s.length !== 64),
          (invalidStr) => {
            expect(() => controller.setCredentials(invalidStr)).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw validation error on non-hex characters (length 8 or 64)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 8 }).filter((s) => !/^[0-9a-fA-F]+$/.test(s)),
          (invalidStr) => {
            expect(() => controller.setCredentials(invalidStr)).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw validation error on invalid lengths (Uint8Array)', () => {
      fc.assert(
        fc.property(
          fc.uint8Array().filter((arr) => arr.length !== 4 && arr.length !== 32),
          (invalidArr) => {
            expect(() => controller.setCredentials(invalidArr)).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
