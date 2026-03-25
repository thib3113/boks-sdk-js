import { BoksPacketOptions } from '../_BoksPacketBase';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/decorators';

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

  constructor(props: ReactivateCodePacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.pin = props.pin;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): ReactivateCodePacket {
    const data = PayloadMapper.parse<ReactivateCodePacketProps>(ReactivateCodePacket, payload, options);
    return new ReactivateCodePacket(data, payload);
  }
}
