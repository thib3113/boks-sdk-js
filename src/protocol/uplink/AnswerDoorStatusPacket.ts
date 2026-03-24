import { PayloadMapper, PayloadBoolean } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Response to ASK_DOOR_STATUS: Current door state.
 */
export interface AnswerDoorStatusPacketProps {
  inverted: boolean;
  status: boolean;
}

export class AnswerDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ANSWER_DOOR_STATUS;

  @PayloadBoolean(0)
  public accessor inverted!: boolean;

  @PayloadBoolean(1)
  public accessor status!: boolean;

  public get isOpen(): boolean {
    return this.status === true && this.inverted === false;
  }

  constructor(props: AnswerDoorStatusPacketProps, raw?: Uint8Array) {
    super(AnswerDoorStatusPacket.opcode, raw);
    this.inverted = props.inverted;
    this.status = props.status;
  }

  static fromRaw(payload: Uint8Array): AnswerDoorStatusPacket {
    const data = PayloadMapper.parse<AnswerDoorStatusPacketProps>(AnswerDoorStatusPacket, payload);
    return new AnswerDoorStatusPacket(data, payload);
  }
}
