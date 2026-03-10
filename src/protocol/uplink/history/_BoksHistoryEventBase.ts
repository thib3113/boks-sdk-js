import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint24 } from '@/protocol/payload-mapper';

/**
 * Base class for all Boks History Event packets.
 */
export abstract class BoksHistoryEvent extends BoksRXPacket {
  @PayloadUint24(0)
  public accessor age!: number;
  public readonly date: Date;

  constructor(opcode: BoksOpcode, age: number = 0, rawPayload?: Uint8Array) {
    super(opcode, rawPayload);
    this.age = age;
    this.date = new Date(Date.now() - age * 1000);
  }
}
