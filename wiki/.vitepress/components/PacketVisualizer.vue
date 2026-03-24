<script setup lang="ts">
import { ref, computed } from 'vue'
import { BoksPacketFactory } from '../../../src/protocol/BoksPacketFactory'
import { PayloadMapper } from '../../../src/protocol/decorators/PayloadMapper'
import { BoksOpcode } from '../../../src/protocol/constants'
import { hexToBytes, bytesToHex } from '../../../src/utils/converters'

const getOpcodeName = (opcode: number): string => {
  return BoksOpcode[opcode] || `UNKNOWN_OPCODE (0x${opcode.toString(16).padStart(2, '0').toUpperCase()})`;
}

// User input
const rawHex = ref('c30400020cffd4') // default valid packet for C3 04 0002 0cff 13

// State
const packetData = computed(() => {
  const hexString = rawHex.value.replace(/[^0-9A-Fa-f]/g, '')
  if (hexString.length < 6 || hexString.length % 2 !== 0) return { error: 'Invalid hexadecimal string length.' }

  const bytes = hexToBytes(hexString)
  if (bytes.length < 3) return { error: 'Packet too short (minimum 3 bytes).' }

  const opcode = bytes[0]
  const length = bytes[1]

  let payloadBytes: Uint8Array
  let checksum: number

  // Try using actual bytes rather than length byte to avoid cutting off
  payloadBytes = bytes.subarray(2, bytes.length - 1);
  checksum = bytes[bytes.length - 1];

  // Attempt to parse
  let packetObj: any = null
  let packetClass: any = null
  let fields: any[] = []
  let parseError = ''

  try {
    // We try to pass the raw bytes.
    // If length byte is totally off, it will throw an error, but that's fine.
    packetObj = BoksPacketFactory.createFromPayload(bytes)
  } catch (e: any) {
    parseError = e.message
  }

  packetClass = BoksPacketFactory.getConstructor(opcode)
  if (packetClass) {
    fields = PayloadMapper.getFields(packetClass)
  }

  const segments: { hex: string, label: string, color: string, value?: any }[] = []

  // 1. Opcode
  segments.push({
    hex: bytesToHex(new Uint8Array([opcode])),
    label: 'Opcode: ' + getOpcodeName(opcode),
    color: '#E91E63' // Pink/Red
  })

  // 2. Length
  segments.push({
    hex: bytesToHex(new Uint8Array([length])),
    label: 'Length',
    color: '#4CAF50' // Green
  })

  // 3. Payload Fields
  let currentOffset = 0
  const colors = [
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#FF9800', // Orange
    '#00BCD4', // Cyan
    '#3F51B5', // Indigo
    '#009688'  // Teal
  ]
  let colorIdx = 0

  // Sort fields by offset just in case
  const sortedFields = [...fields].sort((a, b) => a.offset - b.offset)

  for (const field of sortedFields) {
    // If there's a gap between current offset and next field, add an "Unknown" segment
    if (field.offset > currentOffset && currentOffset < payloadBytes.length) {
      const endGap = Math.min(field.offset, payloadBytes.length)
      const gapBytes = payloadBytes.subarray(currentOffset, endGap)
      segments.push({
        hex: bytesToHex(gapBytes),
        label: 'Unknown Padding',
        color: '#9E9E9E' // Gray
      })
      currentOffset = endGap
    }

    if (currentOffset >= payloadBytes.length) break;

    // Determine field size
    let fieldSize = 1 // default
    if (field.type === 'uint16') fieldSize = 2
    else if (field.type === 'uint24') fieldSize = 3
    else if (field.type === 'uint32') fieldSize = 4
    else if (field.type === 'mac_address' || field.type === 'pin_code') fieldSize = 6
    else if (field.type === 'config_key') fieldSize = 8
    else if (field.type === 'ascii_string' && typeof field.length === 'number') fieldSize = field.length
    else if ((field.type === 'hex_string' || field.type === 'byte_array') && typeof field.length === 'number') fieldSize = field.length
    else if (field.type === 'hex_string' || field.type === 'byte_array') fieldSize = payloadBytes.length - currentOffset // Consumes rest
    else if (field.type === 'var_len_hex') fieldSize = 1 + payloadBytes[currentOffset] // Length byte + data
    else if (field.type === 'bit') fieldSize = 1

    // Bound fieldSize by available payloadBytes
    fieldSize = Math.min(fieldSize, payloadBytes.length - currentOffset)
    if (fieldSize <= 0) continue;

    // Slice field bytes
    const fieldBytes = payloadBytes.subarray(currentOffset, currentOffset + fieldSize)

    // Get parsed value if available
    let parsedValue = packetObj ? packetObj[field.propertyName] : undefined

    segments.push({
      hex: bytesToHex(fieldBytes),
      label: field.propertyName,
      color: colors[colorIdx % colors.length],
      value: parsedValue
    })

    currentOffset += fieldSize
    colorIdx++
  }

  // Any remaining unmapped payload
  if (currentOffset < payloadBytes.length) {
    segments.push({
      hex: bytesToHex(payloadBytes.subarray(currentOffset)),
      label: 'Unmapped Payload',
      color: '#9E9E9E'
    })
  }

  // 4. Checksum
  segments.push({
    hex: bytesToHex(new Uint8Array([checksum])),
    label: 'Checksum',
    color: '#FFC107' // Amber/Yellow
  })

  return { segments, error: parseError }
})

</script>

<template>
  <div class="packet-visualizer">
    <div class="input-group">
      <label for="hexInput">Raw Hexadecimal Packet:</label>
      <input
        id="hexInput"
        v-model="rawHex"
        type="text"
        placeholder="e.g. c30400020cffd4"
        class="hex-input"
        spellcheck="false"
      />
    </div>

    <div v-if="packetData?.error" class="error-msg">
      ⚠️ Parsing Warning: {{ packetData.error }}
    </div>

    <div v-if="packetData?.segments" class="visualization-container">

      <!-- Visual breakdown block -->
      <div class="hex-blocks">
        <span
          v-for="(seg, idx) in packetData.segments"
          :key="idx"
          class="hex-segment"
          :style="{ backgroundColor: seg.color + '22', color: seg.color, borderColor: seg.color }"
          :title="seg.label"
        >
          {{ seg.hex.toUpperCase() }}
        </span>
      </div>

      <!-- Detail table -->
      <table class="detail-table">
        <thead>
          <tr>
            <th>Hex</th>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(seg, idx) in packetData.segments" :key="idx">
            <td class="hex-col" :style="{ color: seg.color }">
              <code>{{ seg.hex.toUpperCase() }}</code>
            </td>
            <td class="label-col">
              <strong>{{ seg.label }}</strong>
            </td>
            <td class="val-col">
              <span v-if="seg.value !== undefined">{{ seg.value }}</span>
              <span v-else class="empty-val">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.packet-visualizer {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.input-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.hex-input {
  width: 100%;
  padding: 0.8rem;
  font-family: monospace;
  font-size: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s;
}
.hex-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.error-msg {
  color: var(--vp-c-red-1);
  background: rgba(239, 68, 68, 0.1);
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.hex-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.hex-segment {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: 1px solid;
  cursor: help;
  transition: transform 0.1s;
}
.hex-segment:hover {
  transform: scale(1.05);
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.detail-table th, .detail-table td {
  padding: 0.6rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
}

.detail-table th {
  background: var(--vp-c-bg-alt);
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.hex-col code {
  font-size: 0.95rem;
  font-weight: bold;
  background: none;
  padding: 0;
}

.label-col {
  color: var(--vp-c-text-1);
}

.val-col {
  color: var(--vp-c-text-2);
}
.empty-val {
  opacity: 0.5;
}
</style>
