import { describe, it, expect } from 'vitest';
import { BoksHardwareSimulator } from '../../src/simulator/BoksSimulator';
import { BoksOpcode, BoksCodeType } from '../../src/protocol/constants';
import { stringToBytes } from '../../src/utils/converters';

describe('BoksSimulator - Codes and Configuration edge cases', () => {
  it('should handle handleDeleteMultiUseCode', async () => {
    const sim = new BoksHardwareSimulator();
    sim.addPinCode('112233', BoksCodeType.Multi);
    const configKeyStr = sim.getInternalState().configKey;
    const configKeyBytes = stringToBytes(configKeyStr);

    const payload = new Uint8Array(14);
    payload.set(configKeyBytes, 0);
    payload.set(stringToBytes('112233'), 8);

    // BoksSimulator methods like handleDeleteMultiUseCode return a Uint8Array response directly when called via GATT characteristic,
    // but the `handlePacket` entry point for simulators tests often expects us to capture the return value or emit.
    // Actually `handlePacket` doesn't emit responses for commands, it relies on characteristic reads.
    // However, the test can just call the internal method, or we can use `sim.writeCharacteristic` and `sim.readCharacteristic`.
    // Wait, the private methods return a Uint8Array.
    // We can cast `sim` to `any` and call the method directly for the unit test to verify logic.
    const res = await (sim as any).handleDeleteMultiUseCode(payload);
    expect(res[0]).toBe(BoksOpcode.CODE_OPERATION_SUCCESS);
    expect(sim.getInternalState().pinCodes.has('112233')).toBe(false);
  });

  it('should handle handleSingleToMulti', async () => {
    const sim = new BoksHardwareSimulator();
    sim.addPinCode('112233', BoksCodeType.Single);
    const configKeyStr = sim.getInternalState().configKey;
    const configKeyBytes = stringToBytes(configKeyStr);

    const payload = new Uint8Array(14);
    payload.set(configKeyBytes, 0);
    payload.set(stringToBytes('112233'), 8);

    const res = await (sim as any).handleSingleToMulti(payload);
    expect(res[0]).toBe(BoksOpcode.CODE_OPERATION_SUCCESS);
    expect(sim.getInternalState().pinCodes.get('112233')).toBe(BoksCodeType.Multi);
  });

  it('should handle handleMultiToSingle', async () => {
    const sim = new BoksHardwareSimulator();
    sim.addPinCode('112233', BoksCodeType.Multi);
    const configKeyStr = sim.getInternalState().configKey;
    const configKeyBytes = stringToBytes(configKeyStr);

    const payload = new Uint8Array(14);
    payload.set(configKeyBytes, 0);
    payload.set(stringToBytes('112233'), 8);

    const res = await (sim as any).handleMultiToSingle(payload);
    expect(res[0]).toBe(BoksOpcode.CODE_OPERATION_SUCCESS);
    expect(sim.getInternalState().pinCodes.get('112233')).toBe(BoksCodeType.Single);
  });

  it('should handle handleReactivateCode', async () => {
    const sim = new BoksHardwareSimulator();
    sim.addPinCode('112233', BoksCodeType.Single); // Reactivating an existing code just returns success in sim
    const configKeyStr = sim.getInternalState().configKey;
    const configKeyBytes = stringToBytes(configKeyStr);

    const payload = new Uint8Array(14);
    payload.set(configKeyBytes, 0);
    payload.set(stringToBytes('112233'), 8);

    const res = await (sim as any).handleReactivateCode(payload);
    expect(res[0]).toBe(BoksOpcode.CODE_OPERATION_SUCCESS);
  });

  it('should handle handleSetConfiguration', async () => {
    const sim = new BoksHardwareSimulator();
    const configKeyStr = sim.getInternalState().configKey;
    const configKeyBytes = stringToBytes(configKeyStr);

    const payload = new Uint8Array(10);
    payload.set(configKeyBytes, 0);
    payload[8] = 0x01; // type
    payload[9] = 0x01; // value = true

    const res = await (sim as any).handleSetConfiguration(payload);
    expect(res[0]).toBe(BoksOpcode.NOTIFY_SET_CONFIGURATION_SUCCESS);
    expect(sim.getInternalState().configuration.laPosteEnabled).toBe(true);
  });

  it('should fail with CODE_OPERATION_ERROR with bad lengths', async () => {
    const sim = new BoksHardwareSimulator();

    const simAsAny = sim as any;

    const r1 = await simAsAny.handleDeleteMultiUseCode(new Uint8Array(2));
    expect(r1[0]).toBe(BoksOpcode.CODE_OPERATION_ERROR);

    const r2 = await simAsAny.handleSingleToMulti(new Uint8Array(2));
    expect(r2[0]).toBe(BoksOpcode.CODE_OPERATION_ERROR);

    const r3 = await simAsAny.handleMultiToSingle(new Uint8Array(2));
    expect(r3[0]).toBe(BoksOpcode.CODE_OPERATION_ERROR);

    const r4 = await simAsAny.handleReactivateCode(new Uint8Array(2));
    expect(r4[0]).toBe(BoksOpcode.CODE_OPERATION_ERROR);

    const r5 = await simAsAny.handleSetConfiguration(new Uint8Array(2));
    expect(r5[0]).toBe(BoksOpcode.CODE_OPERATION_ERROR);
  });
});
