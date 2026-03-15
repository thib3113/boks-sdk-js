import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to reactivate a disabled code.
 */
export interface ReactivateCodePacketProps extends AuthPacketProps {
  pin: string;
}

export class ReactivateCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.REACTIVATE_CODE;
  get opcode() {
    return ReactivateCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: ReactivateCodePacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): ReactivateCodePacket {
    const data = PayloadMapper.parse(ReactivateCodePacket, payload);
    return new ReactivateCodePacket(data as unknown as ReactivateCodePacketProps, payload);
  }
}
