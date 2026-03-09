import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

export interface OpenDoorPacketProps {
  pin: string;
}

/**
 * Command to open the door with a 6-character PIN.
 */
export class OpenDoorPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.OPEN_DOOR;

  @PayloadPinCode(0)
  public readonly pin: string;

  get opcode() {
    return OpenDoorPacket.opcode;
  }

  constructor(props: OpenDoorPacketProps) {
    super();
    // BoksPacketBase's formatPin is protected, but we can do uppercase here
    this.pin = props.pin ? props.pin.toUpperCase() : props.pin;
    PayloadMapper.validate(this);
  }

  static fromPayload(payload: Uint8Array): OpenDoorPacket {
    const data = PayloadMapper.parse(OpenDoorPacket, payload);
    return new OpenDoorPacket({ pin: data.pin as string });
  }

  toPayload(): Uint8Array {
    return PayloadMapper.serialize(this);
  }
}
