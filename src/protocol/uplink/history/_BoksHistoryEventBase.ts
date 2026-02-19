import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Base class for all Boks History Event packets.
 */
export abstract class BoksHistoryEvent extends BoksRXPacket {
  public age: number = 0;

  constructor(opcode: BoksOpcode, age: number = 0, rawPayload?: Uint8Array) {
    super(opcode, rawPayload);
    this.age = age;
  }
}
