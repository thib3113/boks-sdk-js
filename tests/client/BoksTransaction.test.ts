import { describe, it, expect } from 'vitest';
import { BoksTransaction, BoksTransactionStatus } from '@/client/BoksTransaction';
import { BoksPacket, BoksOpcode } from '@/protocol';

// Mock concrete implementation of BoksPacket for testing
class MockPacket extends BoksPacket {
  constructor(public opcode: BoksOpcode, private payload: Uint8Array = new Uint8Array(0)) {
    super();
  }
  toPayload() { return this.payload; }
}

describe('BoksTransaction', () => {
  it('should initialize with pending status', () => {
    const req = new MockPacket(BoksOpcode.OPEN_DOOR);
    const tx = new BoksTransaction(req);
    expect(tx.status).toBe(BoksTransactionStatus.Pending);
    expect(tx.request).toBe(req);
    expect(tx.response).toBeNull();
    expect(tx.intermediates).toHaveLength(0);
  });

  it('should complete successfully', () => {
    const req = new MockPacket(BoksOpcode.OPEN_DOOR);
    const res = new MockPacket(BoksOpcode.VALID_OPEN_CODE);
    const tx = new BoksTransaction(req);

    tx.complete(res);

    expect(tx.status).toBe(BoksTransactionStatus.Success);
    expect(tx.response).toBe(res);
    expect(tx.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should handle failure', () => {
    const req = new MockPacket(BoksOpcode.OPEN_DOOR);
    const tx = new BoksTransaction(req);
    const err = new Error('Test error');

    tx.fail(err);

    expect(tx.status).toBe(BoksTransactionStatus.Error);
    expect(tx.error).toBe(err);
  });

  it('should handle timeout', () => {
    const req = new MockPacket(BoksOpcode.OPEN_DOOR);
    const tx = new BoksTransaction(req);

    tx.timeout();

    expect(tx.status).toBe(BoksTransactionStatus.Timeout);
  });

  it('should collect intermediates and return allPackets', () => {
    const req = new MockPacket(BoksOpcode.REQUEST_LOGS);
    const log1 = new MockPacket(BoksOpcode.LOG_DOOR_OPEN);
    const log2 = new MockPacket(BoksOpcode.LOG_DOOR_CLOSE);
    const res = new MockPacket(BoksOpcode.LOG_END_HISTORY);

    const tx = new BoksTransaction(req);
    tx.addIntermediate(log1);
    tx.addIntermediate(log2);
    tx.complete(res);

    expect(tx.intermediates).toEqual([log1, log2]);
    expect(tx.allPackets).toEqual([req, log1, log2, res]);
  });
});
