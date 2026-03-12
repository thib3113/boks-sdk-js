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

  constructor(configKey: string, index: number, newPin: string) {
    super(configKey);
    validateMasterCodeIndex(index);
    this.index = index;
    this.newPin = newPin;
  }

  static fromPayload(payload: Uint8Array): MasterCodeEditPacket {
    const data = PayloadMapper.parse(MasterCodeEditPacket, payload);
    return new MasterCodeEditPacket(
      data.configKey as string,
      data.index || 0,
      data.newPin as string
    );
  }
}
