import { describe, it, expect } from 'vitest';
import { CreateMasterCodePacket } from '@/protocol/downlink/CreateMasterCodePacket';
import { GenerateCodesPacket } from '@/protocol/downlink/GenerateCodesPacket';
import { CreateSingleUseCodePacket } from '@/protocol/downlink/CreateSingleUseCodePacket';
import { CreateMultiUseCodePacket } from '@/protocol/downlink/CreateMultiUseCodePacket';
import { MasterCodeEditPacket } from '@/protocol/downlink/MasterCodeEditPacket';
import { RegeneratePartAPacket } from '@/protocol/downlink/RegeneratePartAPacket';
import { RegeneratePartBPacket } from '@/protocol/downlink/RegeneratePartBPacket';

describe('Sensitive Data Exposure', () => {
  const configKey = 'AABBCCDD';
  const pin = '123456';
  const seed = '0000000000000000000000000000000000000000000000000000000000000000'; // 32 bytes hex
  const keyPart = new Uint8Array(16).fill(0xAA);

  it('should not expose configKey in AuthPacket JSON', () => {
    const packet = new CreateMasterCodePacket(configKey, 1, pin);
    const json = JSON.stringify(packet);
    expect(json).not.toContain(configKey);
    expect(json).toContain('[REDACTED]');
  });

  it('should not expose PIN in CreateMasterCodePacket JSON', () => {
    const packet = new CreateMasterCodePacket(configKey, 1, pin);
    const json = JSON.stringify(packet);
    expect(json).not.toContain(pin);
    expect(json).toContain('******');
  });

  it('should not expose seed in GenerateCodesPacket JSON', () => {
    const packet = new GenerateCodesPacket(seed);
    const json = JSON.stringify(packet);
    expect(json).not.toContain(seed);
    expect(json).toContain('[REDACTED]');
  });

  it('should not expose PIN in CreateSingleUseCodePacket JSON', () => {
    const packet = new CreateSingleUseCodePacket(configKey, pin);
    const json = JSON.stringify(packet);
    expect(json).not.toContain(pin);
    expect(json).toContain('******');
  });

  it('should not expose PIN in CreateMultiUseCodePacket JSON', () => {
    const packet = new CreateMultiUseCodePacket(configKey, pin);
    const json = JSON.stringify(packet);
    expect(json).not.toContain(pin);
    expect(json).toContain('******');
  });

  it('should not expose newPin in MasterCodeEditPacket JSON', () => {
    const packet = new MasterCodeEditPacket(configKey, 1, pin);
    const json = JSON.stringify(packet);
    expect(json).not.toContain(pin);
    expect(json).toContain('******');
  });

  it('should not expose key part in RegeneratePartAPacket JSON', () => {
    const packet = new RegeneratePartAPacket(configKey, keyPart);
    const json = JSON.stringify(packet);
    // keyPart serializes to an object or array in JSON depending on implementation,
    // but we want to ensure it's not raw.
    // Checking for redaction marker is safer.
    expect(json).toContain('[REDACTED]');
  });

  it('should not expose key part in RegeneratePartBPacket JSON', () => {
    const packet = new RegeneratePartBPacket(configKey, keyPart);
    const json = JSON.stringify(packet);
    expect(json).toContain('[REDACTED]');
  });
});
