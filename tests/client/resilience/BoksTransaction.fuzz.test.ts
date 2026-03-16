import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BoksTransaction, BoksTransactionStatus } from '@/client/BoksTransaction';
import { BoksPacket, BoksOpcode } from '@/protocol';

class MockPacket extends BoksPacket {
  constructor(
    public opcode: BoksOpcode,
    private payload: Uint8Array = new Uint8Array(0)
  ) {
    super();
  }
  toPayload() {
    return this.payload;
  }
}

// Commands for the state machine
class CompleteCommand implements fc.Command<any, any> {
  constructor(public response: MockPacket) {}
  check = () => true;
  run(_m: any, tx: BoksTransaction) {
    tx.complete(this.response);
    expect(tx.status).toBe(BoksTransactionStatus.Success);
    expect(tx.response).toBe(this.response);
    expect(tx.isSuccess).toBe(true);
    expect((tx as any).finishedAt).toBeDefined();
    expect(tx.durationMs).toBeGreaterThanOrEqual(0);
  }
  toString = () => `Complete`;
}

class FailCommand implements fc.Command<any, any> {
  constructor(public error: Error) {}
  check = () => true;
  run(_m: any, tx: BoksTransaction) {
    tx.fail(this.error);
    expect(tx.status).toBe(BoksTransactionStatus.Error);
    expect(tx.error).toBe(this.error);
    expect(tx.isSuccess).toBe(false);
    expect((tx as any).finishedAt).toBeDefined();
    expect(tx.durationMs).toBeGreaterThanOrEqual(0);
  }
  toString = () => `Fail`;
}

class TimeoutCommand implements fc.Command<any, any> {
  check = () => true;
  run(_m: any, tx: BoksTransaction) {
    tx.timeout();
    expect(tx.status).toBe(BoksTransactionStatus.Timeout);
    expect(tx.isSuccess).toBe(false);
    expect((tx as any).finishedAt).toBeDefined();
    expect(tx.durationMs).toBeGreaterThanOrEqual(0);
  }
  toString = () => `Timeout`;
}

class AddIntermediateCommand implements fc.Command<any, any> {
  constructor(public packet: MockPacket) {}
  check = () => true;
  run(_m: any, tx: BoksTransaction) {
    const previousLength = tx.intermediates.length;
    tx.addIntermediate(this.packet);
    expect(tx.intermediates.length).toBe(previousLength + 1);
    expect(tx.intermediates[tx.intermediates.length - 1]).toBe(this.packet);
  }
  toString = () => `AddIntermediate`;
}

describe('BoksTransaction Fuzzing', () => {
  it('should maintain state invariants across arbitrary command sequences', () => {
    // Generate valid random mock packets
    const packetArbitrary = fc
      .tuple(
        fc.integer({ min: 0x00, max: 0xFF }), // Opcode range
        fc.uint8Array() // Payload
      )
      .map(([opcode, payload]) => new MockPacket(opcode as BoksOpcode, payload));

    const errorArbitrary = fc.string().map((msg) => new Error(msg));

    const commandsArbitrary = fc.commands(
      [
        packetArbitrary.map((p) => new CompleteCommand(p)),
        errorArbitrary.map((e) => new FailCommand(e)),
        fc.constant(new TimeoutCommand()),
        packetArbitrary.map((p) => new AddIntermediateCommand(p))
      ],
      { maxCommands: 100 }
    );

    fc.assert(
      fc.property(
        packetArbitrary, // Request packet
        commandsArbitrary,
        (request, cmds) => {
          const tx = new BoksTransaction(request);

          const setup = () => ({
            model: {} as any, // Model not strictly needed here since assertions run in Commands
            real: tx
          });

          fc.modelRun(setup, cmds);

          // Verify invariants that must ALWAYS hold, regardless of state

          // 1. request invariant
          expect(tx.request).toBe(request);

          // 2. allPackets structure
          const expectedPackets = [request, ...tx.intermediates];
          if (tx.response) {
            expectedPackets.push(tx.response);
          }
          expect(tx.allPackets).toEqual(expectedPackets);

          // 3. Status implies state constraints
          if (tx.status === BoksTransactionStatus.Pending) {
            expect(tx.isSuccess).toBe(false);
            expect(tx.response).toBeNull();
            expect(tx.error).toBeNull();
            expect((tx as any).finishedAt).toBeNull();
          } else {
            // Not pending implies finishedAt is set
            expect((tx as any).finishedAt).toBeTypeOf('number');
            // durationMs is calculable
            expect(tx.durationMs).toBeGreaterThanOrEqual(0);
          }

          if (tx.isSuccess) {
            expect(tx.status).toBe(BoksTransactionStatus.Success);
            expect(tx.response).not.toBeNull();
          }
        }
      )
    );
  });
});
