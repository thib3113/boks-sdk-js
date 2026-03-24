<script setup lang="ts">
import { ref, computed } from 'vue'
import { BoksPacketFactory } from '../../../src/protocol/BoksPacketFactory'
import { PayloadMapper } from '../../../src/protocol/decorators/PayloadMapper'
import { BoksOpcode } from '../../../src/protocol/constants'
import { hexToBytes } from '../../../src/utils/converters'

const getOpcodeName = (opcode: number): string => {
  return BoksOpcode[opcode] || `UNKNOWN_OPCODE (0x${opcode.toString(16).padStart(2, '0').toUpperCase()})`;
}

const rawHex = ref('c30400020cffd4')

const inputRef = ref<HTMLInputElement | null>(null)
const overlayRef = ref<HTMLDivElement | null>(null)

const rawHexInput = computed({
  get: () => rawHex.value,
  set: (val: string) => {
    // Strip non-hex characters and lowercase
    rawHex.value = val.replace(/[^0-9a-fA-F]/g, '').toLowerCase()
  }
})

const handleScroll = () => {
  if (inputRef.value && overlayRef.value) {
    overlayRef.value.scrollLeft = inputRef.value.scrollLeft
  }
}

const packetData = computed(() => {
  const hexStr = rawHex.value
  const segments: any[] = []

  let cursor = 0;
  const takeChars = (count: number, props: any) => {
    if (cursor >= hexStr.length) return false;
    const available = Math.min(count, hexStr.length - cursor)
    const text = hexStr.slice(cursor, cursor + available)
    segments.push({ text, ...props })
    cursor += available
    return available === count;
  }

  if (hexStr.length === 0) return { segments: [], error: null }

  // 1. Opcode
  if (!takeChars(2, { label: 'Opcode', color: '#E91E63' })) return { segments, error: 'Incomplete Opcode' }

  // 2. Length
  if (!takeChars(2, { label: 'Length', color: '#4CAF50' })) return { segments, error: 'Incomplete Length' }

  const expectedPayloadBytes = parseInt(hexStr.slice(2, 4), 16) || 0
  const expectedPayloadChars = expectedPayloadBytes * 2

  const bytes = hexToBytes(hexStr.slice(0, cursor + (hexStr.length - cursor - (hexStr.length % 2))))
  const opcode = bytes[0]

  let packetClass = BoksPacketFactory.getConstructor(opcode)
  let fields: any[] = []
  if (packetClass) {
    fields = PayloadMapper.getFields(packetClass)
  }

  // 3. Payload
  const actualPayloadChars = Math.min(expectedPayloadChars, hexStr.length - cursor)

  if (actualPayloadChars > 0) {
    const payloadHexStr = hexStr.slice(cursor, cursor + actualPayloadChars)
    const payloadBytes = hexToBytes(payloadHexStr.length % 2 === 0 ? payloadHexStr : payloadHexStr.slice(0, -1))

    const colors = ['#2196F3', '#9C27B0', '#FF9800', '#00BCD4', '#3F51B5', '#009688']
    let colorIdx = 0
    let currentByteOffset = 0
    const sortedFields = [...fields].sort((a, b) => a.offset - b.offset)

    const endOfPayload = cursor + actualPayloadChars;

    for (const field of sortedFields) {
      if (cursor >= endOfPayload) break;

      if (field.offset > currentByteOffset) {
        const gapBytes = field.offset - currentByteOffset
        const gapChars = gapBytes * 2
        if (!takeChars(gapChars, { label: 'Unknown Padding', color: '#9E9E9E' })) break;
        currentByteOffset += gapBytes
      }

      if (cursor >= endOfPayload) break;

      let fieldSize = 1
      if (field.type === 'uint16') fieldSize = 2
      else if (field.type === 'uint24') fieldSize = 3
      else if (field.type === 'uint32') fieldSize = 4
      else if (field.type === 'mac_address' || field.type === 'pin_code') fieldSize = 6
      else if (field.type === 'config_key') fieldSize = 8
      else if (field.type === 'ascii_string' && typeof field.length === 'number') fieldSize = field.length
      else if ((field.type === 'hex_string' || field.type === 'byte_array') && typeof field.length === 'number') fieldSize = field.length
      else if (field.type === 'hex_string' || field.type === 'byte_array') fieldSize = Math.max(0, expectedPayloadBytes - currentByteOffset)
      else if (field.type === 'var_len_hex') fieldSize = 1 + (payloadBytes[currentByteOffset] || 0)
      else if (field.type === 'bit') fieldSize = 1

      const charsAvailable = endOfPayload - cursor
      const charsToTake = Math.min(fieldSize * 2, charsAvailable)

      if (charsToTake > 0) {
        takeChars(charsToTake, { label: field.propertyName, color: colors[colorIdx % colors.length] })
        currentByteOffset += Math.ceil(charsToTake / 2)
        colorIdx++
      }
    }

    if (cursor < endOfPayload) {
      takeChars(endOfPayload - cursor, { label: 'Unmapped Payload', color: '#9E9E9E' })
    }
  }

  // 4. Checksum
  if (cursor < hexStr.length) {
    const checksumCharsAvailable = Math.min(2, hexStr.length - cursor)
    takeChars(checksumCharsAvailable, { label: 'Checksum', color: '#FFC107' })
  }

  // 5. Extra bytes
  if (cursor < hexStr.length) {
    takeChars(hexStr.length - cursor, { label: 'Extra Bytes (Invalid)', color: '#F44336' })
  }

  // Attempt to parse actual packet to get values for the detail table
  let packetObj: any = null
  let parseError = ''

  if (hexStr.length >= 6 && hexStr.length % 2 === 0) {
    try {
      packetObj = BoksPacketFactory.createFromPayload(hexToBytes(hexStr))
    } catch (e: any) {
      parseError = e.message
    }
  } else if (hexStr.length % 2 !== 0) {
    parseError = 'Incomplete hexadecimal string length.'
  } else if (hexStr.length < 6) {
    parseError = 'Packet too short (minimum 3 bytes: Opcode, Length, Checksum).'
  }

  const detailSegments = segments.map(seg => {
    let val = undefined
    if (packetObj && seg.label && packetObj[seg.label] !== undefined) {
      val = packetObj[seg.label]
    }
    if (seg.label === 'Opcode') {
      seg.label = 'Opcode: ' + getOpcodeName(opcode)
    }
    return { ...seg, value: val }
  })

  return { segments: detailSegments, error: parseError }
})

</script>

<template>
  <div class="packet-visualizer">
    <div class="input-group">
      <label for="hexInput">Raw Hexadecimal Packet:</label>
      <div class="input-container">
        <!-- Colored overlay behind/under the text -->
        <div class="input-overlay" ref="overlayRef" aria-hidden="true">
          <span
            v-for="(seg, idx) in packetData.segments"
            :key="idx"
            :style="{ color: seg.color }"
          >{{ seg.text }}</span>
        </div>

        <!-- The actual input, text is transparent -->
        <input
          id="hexInput"
          ref="inputRef"
          v-model="rawHexInput"
          @scroll="handleScroll"
          type="text"
          placeholder="e.g. c30400020cffd4"
          class="hex-input"
          spellcheck="false"
          autocomplete="off"
        />
      </div>
    </div>

    <div v-if="packetData?.error" class="error-msg">
      ⚠️ Parsing Warning: {{ packetData.error }}
    </div>

    <div v-if="packetData?.segments && packetData.segments.length > 0" class="visualization-container">

      <!-- Visual breakdown block -->
      <div class="hex-blocks">
        <span
          v-for="(seg, idx) in packetData.segments"
          :key="idx"
          class="hex-segment"
          :style="{ backgroundColor: seg.color + '22', color: seg.color, borderColor: seg.color }"
          :title="seg.label"
        >
          {{ seg.text.toUpperCase() }}
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
              <code>{{ seg.text.toUpperCase() }}</code>
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

.input-container {
  position: relative;
  width: 100%;
}

.input-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.8rem 0.9rem; /* Adjusted padding slightly for font alignment */
  font-family: monospace;
  font-size: 1.1rem;      /* Use a bigger monospace for better visibility */
  font-weight: bold;
  letter-spacing: 2px;    /* Letter spacing to align exactly */
  white-space: pre;
  overflow: hidden;
  pointer-events: none;
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  background: var(--vp-c-bg);
  border-radius: 6px;
  color: var(--vp-c-text-1);
}

.input-overlay span {
  transition: color 0.2s;
}

.hex-input {
  width: 100%;
  padding: 0.8rem 0.9rem;
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: transparent;
  color: transparent; /* Make user text transparent so overlay shows through */
  caret-color: var(--vp-c-text-1);
  transition: border-color 0.2s;
  position: relative;
  z-index: 2;
}

.hex-input::placeholder {
  color: var(--vp-c-text-3);
  letter-spacing: normal;
}

.hex-input:placeholder-shown + .input-overlay {
  display: none;
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
