import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadBoolean, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Response to ASK_DOOR_STATUS: Current door state.
 */
export class AnswerDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ANSWER_DOOR_STATUS;

  @PayloadBoolean(0)
  public accessor inverted!: boolean;

  @PayloadBoolean(1)
  public accessor raw!: boolean;

  public get isOpen(): boolean {
    return this.raw === true && this.inverted === false;
  }

  constructor(props: { inverted: boolean; raw: boolean }, rawPayload?: Uint8Array) {
    super(AnswerDoorStatusPacket.opcode, rawPayload);
    this.inverted = props.inverted;
    this.raw = props.raw;
  }

  static fromPayload(payload: Uint8Array): AnswerDoorStatusPacket {
    const parsed = PayloadMapper.parse(AnswerDoorStatusPacket, payload);
    return new AnswerDoorStatusPacket({ inverted: parsed.inverted!, raw: parsed.raw! }, payload);
  }
}
