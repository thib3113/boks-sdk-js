import { describe, it, expect } from 'vitest';
import { CodeKeyValidHistoryPacket } from '../../src/protocol/uplink/history/CodeKeyValidHistoryPacket';
import { OpenDoorPacket } from '../../src/protocol/downlink/OpenDoorPacket';
import { CreateMasterCodePacket } from '../../src/protocol/downlink/CreateMasterCodePacket';

describe('Security: PIN Leakage', () => {
  it('should mask PIN in JSON serialization for History Packets', () => {
    const packet = new CodeKeyValidHistoryPacket(0, '123456');
    const json = JSON.stringify(packet);
    expect(json).not.toContain('123456');
    expect(json).toContain('******');
  });

  it('should mask PIN in JSON serialization for Command Packets', () => {
    const packet = new OpenDoorPacket('654321');
    const json = JSON.stringify(packet);
    expect(json).not.toContain('654321');
    expect(json).toContain('******');
  });

  it('should mask PIN and ConfigKey in JSON serialization for Auth Packets', () => {
    const packet = new CreateMasterCodePacket('AABBCCDD', 0, '123456');
    const json = JSON.stringify(packet);

    // Check ConfigKey
    expect(json).not.toContain('AABBCCDD');
    expect(json).toContain('********');

    // Check PIN
    expect(json).not.toContain('123456');
    expect(json).toContain('******');
  });
});
