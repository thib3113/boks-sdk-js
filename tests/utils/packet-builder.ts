import { PACKET_HEADER_SIZE } from '../../src/protocol/constants';
import { calculateChecksum } from '../../src/utils/converters';
import { buildMockRawPacket } from '../../utils/packet-builder';

/**
 * Builds a valid mock raw Boks packet including header and checksum.
 * Used for testing strict fromRaw behavior without test-induced design damage.
 *
 * @param opcode The packet opcode.
 * @param payloadData The raw data payload.
 * @param lengthIncludesHeader Whether the length byte includes the header size.
 * @returns A Uint8Array containing the fully formed packet.
 */
export function buildMockRawPacket(
  opcode: number,
  payloadData: Uint8Array,
  lengthIncludesHeader: boolean = false
): Uint8Array {
  const payloadLength = payloadData.length;
  const lengthByte = lengthIncludesHeader ? payloadLength + PACKET_HEADER_SIZE : payloadLength;

  const packet = new Uint8Array(PACKET_HEADER_SIZE + payloadLength);
  packet[0] = opcode;
  packet[1] = lengthByte;
  packet.set(payloadData, 2);

  // Last byte is the checksum
  packet[packet.length - 1] = calculateChecksum(packet, 0, packet.length - 1);

  return packet;
}
