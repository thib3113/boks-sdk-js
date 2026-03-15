import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint24 } from '@/protocol/payload-mapper';

/**
 * Base class for all Boks History Event packets.
 */
export interface BoksHistoryEventProps {
  age: number;
}

export abstract class BoksHistoryEvent extends BoksRXPacket {
  @PayloadUint24(0)
  public accessor age!: number;
  public readonly date: Date;

  constructor(opcode: BoksOpcode, props: BoksHistoryEventProps, rawPayload?: Uint8Array) {
    super(opcode, rawPayload);
    this.age = props.age;
    this.date = new Date(Date.now() - this.age * 1000);
  }
}
