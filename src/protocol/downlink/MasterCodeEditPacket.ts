import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode, PayloadMasterCodeIndex } from '@/protocol/payload-mapper';
import { validateMasterCodeIndex } from '@/utils/validation';

/**
 * Command to edit an existing master code.
 * (UNTESTED)
 */
export class MasterCodeEditPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.MASTER_CODE_EDIT;
  get opcode() {
    return MasterCodeEditPacket.opcode;
  }

  @PayloadMasterCodeIndex(8)
  public accessor index!: number;

  @PayloadPinCode(9)
  public accessor newPin!: string;

  constructor(
    props: { configKey: string; index: number; newPin: string },
    rawPayload?: Uint8Array
  ) {
    super(props.configKey, rawPayload);
    validateMasterCodeIndex(props.index);
    this.index = props.index;
    this.newPin = props.newPin;
  }

  static fromPayload(payload: Uint8Array): MasterCodeEditPacket {
    const data = PayloadMapper.parse(MasterCodeEditPacket, payload);
    return new MasterCodeEditPacket(
      {
        configKey: data.configKey as string,
        index: data.index || 0,
        newPin: data.newPin as string
      },
      payload
    );
  }
}
