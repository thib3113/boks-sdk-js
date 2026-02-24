import { BoksPacket } from '@/protocol/_BoksPacketBase';

export enum BoksTransactionStatus {
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
  Timeout = 'timeout'
}

/**
 * Represents a single request/response cycle with a Boks device.
 * Captures the request, any intermediate packets (e.g. progress updates),
 * and the final response or error.
 */
export class BoksTransaction<
  TRequest extends BoksPacket = BoksPacket,
  TResponse extends BoksPacket = BoksPacket
> {
  public readonly request: TRequest;
  public response: TResponse | null = null;
  public intermediates: BoksPacket[] = [];
  public status: BoksTransactionStatus = BoksTransactionStatus.Pending;
  public error: Error | null = null;

  private readonly startedAt: number;
  private finishedAt: number | null = null;

  constructor(request: TRequest) {
    this.request = request;
    this.startedAt = Date.now();
  }

  /**
   * Marks the transaction as successful with the given response.
   */
  complete(response: TResponse): void {
    this.response = response;
    this.status = BoksTransactionStatus.Success;
    this.finishedAt = Date.now();
  }

  /**
   * Marks the transaction as failed with an error.
   */
  fail(error: Error): void {
    this.error = error;
    this.status = BoksTransactionStatus.Error;
    this.finishedAt = Date.now();
  }

  /**
   * Marks the transaction as timed out.
   */
  timeout(): void {
    this.status = BoksTransactionStatus.Timeout;
    this.finishedAt = Date.now();
  }

  /**
   * Adds an intermediate packet to the transaction.
   */
  addIntermediate(packet: BoksPacket): void {
    this.intermediates.push(packet);
  }

  /**
   * Returns the duration of the transaction in milliseconds.
   * If the transaction is still pending, returns the time elapsed since start.
   */
  get durationMs(): number {
    const end = this.finishedAt ?? Date.now();
    return end - this.startedAt;
  }

  /**
   * Returns a chronological array of all packets involved in the transaction:
   * [request, ...intermediates, response]
   * (response is included only if present)
   */
  get allPackets(): BoksPacket[] {
    const packets = [this.request, ...this.intermediates];
    if (this.response) {
      packets.push(this.response);
    }
    return packets;
  }
}
