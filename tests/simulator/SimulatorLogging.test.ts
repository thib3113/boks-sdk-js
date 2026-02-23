import { describe, it, expect, vi } from 'vitest';
import { BoksHardwareSimulator, BoksSimulatorLogger } from '../../src/simulator/BoksSimulator';
import { BoksOpcode } from '../../src/protocol/constants';

describe('Boks Hardware Simulator Logging', () => {
  it('should call the logger on storage read errors', () => {
    const logger = vi.fn() as unknown as BoksSimulatorLogger;
    const storage = {
      get: vi.fn().mockReturnValue('invalid json'),
      set: vi.fn()
    };

    new BoksHardwareSimulator({ storage, logger });

    expect(logger).toHaveBeenCalledWith(
      'warn',
      'storage_read_error',
      expect.objectContaining({ key: 'logs' })
    );
    expect(logger).toHaveBeenCalledWith(
      'warn',
      'storage_read_error',
      expect.objectContaining({ key: 'pinCodes' })
    );
  });

  it('should call the logger on receive and send', async () => {
    const logger = vi.fn() as unknown as BoksSimulatorLogger;
    const simulator = new BoksHardwareSimulator({ logger });

    // Valid Ask Door Status Packet: 0x02 0x00 0x02
    const packet = new Uint8Array([BoksOpcode.ASK_DOOR_STATUS, 0, 0x02]);
    await simulator.handlePacket(packet);

    expect(logger).toHaveBeenCalledWith(
      'debug',
      'receive',
      expect.objectContaining({ opcode: BoksOpcode.ASK_DOOR_STATUS })
    );

    // Give some time for the response
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(logger).toHaveBeenCalledWith(
      'debug',
      'send',
      expect.objectContaining({ opcode: BoksOpcode.ANSWER_DOOR_STATUS })
    );
  });

  it('should call the logger on checksum error', async () => {
    const logger = vi.fn() as unknown as BoksSimulatorLogger;
    const simulator = new BoksHardwareSimulator({ logger });

    // Invalid Checksum: 0x02 0x00 0xFF
    const packet = new Uint8Array([BoksOpcode.ASK_DOOR_STATUS, 0, 0xFF]);
    await simulator.handlePacket(packet);

    expect(logger).toHaveBeenCalledWith(
      'warn',
      'checksum_error',
      expect.objectContaining({
        opcode: BoksOpcode.ASK_DOOR_STATUS,
        received: 0xFF
      })
    );
  });
});
