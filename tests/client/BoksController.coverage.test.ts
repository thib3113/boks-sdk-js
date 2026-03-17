import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BoksController } from '../../src/client/BoksController';
import { BoksClient } from '../../src/client/BoksClient';
import { BoksClientError } from '../../src/errors/BoksClientError';
import { NotifyScaleRawSensorsPacket } from '../../src/protocol/scale/NotifyScaleRawSensorsPacket';

describe('BoksController Coverage Gaps', () => {
    let client: BoksClient;
    let controller: BoksController;

    beforeEach(() => {
        client = new BoksClient({ device: {} as any });
        controller = new BoksController(client);
    });

    it('should allow injecting BoksClient in constructor', () => {
        const c = new BoksController(client);
        expect(c).toBeDefined();
    });

    it('should throw if credentials are not set', () => {
        expect(() => (controller as any).getConfigKeyOrThrow()).toThrow(BoksClientError);
    });

    it('should handle missing hardware info during check', () => {
        expect(() => (controller as any).checkRequirements({ featureName: 'test', minHw: '4.0' })).toThrow(BoksClientError);
    });

    it('should throw if hardware version mismatch', () => {
        (controller as any)._hardwareInfo = { hardwareVersion: '3.0', softwareRevision: '1.0.0', firmwareRevision: '1.0.0' };
        expect(() => (controller as any).checkRequirements({ featureName: 'test', minHw: '4.0' })).toThrow(BoksClientError);
    });

    it('should check software version correctly', () => {
        (controller as any)._hardwareInfo = { hardwareVersion: '4.0', softwareRevision: '1.2.3', firmwareRevision: '1.0.0' };
        
        // Higher version
        (controller as any).checkRequirements({ featureName: 'test', minSw: '1.2.0' });
        
        // Lower version
        expect(() => (controller as any).checkRequirements({ featureName: 'test', minSw: '1.3.0' })).toThrow(BoksClientError);
    });

    it('should derive hardware info correctly for nRF52811', () => {
        const info = (controller as any).deriveHardwareInfo('10/cd', '1.0.0');
        expect(info.hardwareVersion).toBe('3.0');
        expect(info.chipset).toBe('nRF52811');
    });

    it('should handle performTransaction error without tx.error', async () => {
        vi.spyOn(client, 'execute').mockResolvedValue({ isSuccess: false, intermediates: [] } as any);
        await expect(controller.getScaleRawSensors()).rejects.toThrow(BoksClientError);
    });

    it('should handle unexpected packet during NFC scan', async () => {
        controller.setCredentials('12345678');
        vi.spyOn(client, 'execute').mockResolvedValue({ 
            isSuccess: false, 
            response: { opcode: 0xFF },
            intermediates: [] 
        } as any);
        await expect(controller.registerNfcTag('AABBCCDD')).rejects.toThrow(BoksClientError);
    });

    it('should handle NFC scan timeout (tx.error provided)', async () => {
        controller.setCredentials('12345678');
        (controller as any)._hardwareInfo = { hardwareVersion: '4.0', softwareRevision: '4.5.1' };
        vi.spyOn(client, 'execute').mockResolvedValue({ 
            isSuccess: false, 
            error: new Error('timeout'),
            intermediates: [] 
        } as any);
        const result = await controller.registerNfcTag('AABBCCDD');
        expect(result).toBe(false);
    });

    it('should return scale raw sensors data on success', async () => {
        const mockData = new Uint8Array([1, 2, 3]);
        vi.spyOn(client, 'execute').mockResolvedValue({ 
            isSuccess: true, 
            response: new NotifyScaleRawSensorsPacket(mockData),
            intermediates: [] 
        } as any);
        const data = await controller.getScaleRawSensors();
        expect(data).toEqual(mockData);
    });

    it('should call battery and history methods', async () => {
        vi.spyOn(client, 'getBatteryStats').mockResolvedValue({} as any);
        vi.spyOn(client, 'fetchHistory').mockResolvedValue([]);
        await controller.getBatteryStats();
        await controller.fetchHistory();
    });

    it('should call multi-use and other methods', async () => {
        controller.setCredentials('12345678');
        vi.spyOn(client, 'execute').mockResolvedValue({ isSuccess: true } as any);
        
        await controller.createMultiUseCode('123456');
        await controller.deleteSingleUseCode('123456');
        await controller.deleteMultiUseCode('123456');
        await controller.reactivateCode('123456');
        
        expect(client.execute).toHaveBeenCalledTimes(4);
    });
});
