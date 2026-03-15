import { PayloadMapper } from '@/protocol/payload-mapper';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { writeConfigKeyToBuffer, hexToBytes } from '@/utils/converters';
import { PayloadNfcUid } from '@/protocol/payload-mapper';

/**
 * Command to unregister an NFC tag.
 */
export interface UnregisterNfcTagPacketProps extends AuthPacketProps {
  uid: string;
}

export class UnregisterNfcTagPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.UNREGISTER_NFC_TAG;
  get opcode() {
    return UnregisterNfcTagPacket.opcode;
  }

  @PayloadNfcUid(8)
  public accessor uid!: string;

  constructor(props: UnregisterNfcTagPacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.uid = props.uid;
  }

  static fromPayload(payload: Uint8Array): UnregisterNfcTagPacket {
    const data = PayloadMapper.parse(UnregisterNfcTagPacket, payload);
    return new UnregisterNfcTagPacket(data as unknown as UnregisterNfcTagPacketProps, payload);
  }

  toPayload(): Uint8Array {
    const uidBytes = hexToBytes(this.uid);
    const payload = new Uint8Array(8 + 1 + uidBytes.length);
    writeConfigKeyToBuffer(payload, 0, this.configKey);
    payload[8] = uidBytes.length; // From protocol.md: UID_Length (1 octet)
    payload.set(uidBytes, 9);
    return payload;
  }
}
