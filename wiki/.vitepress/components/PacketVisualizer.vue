<script setup lang="ts">
import { ref, computed } from 'vue'
import { BoksPacketFactory } from '../../../src/protocol/BoksPacketFactory'
import { PayloadMapper } from '../../../src/protocol/decorators/PayloadMapper'
import { BoksOpcode, PACKET_HEADER_SIZE, PACKET_MIN_HEADER_SIZE } from '../../../src/protocol/constants'
import { hexToBytes, bytesToHex } from '../../../src/utils/converters'
import { useData } from 'vitepress'
import { i18n } from '../i18n'

const { lang } = useData()
const t = computed(() => i18n[lang.value === 'fr' ? 'fr' : 'en'].visualizer)

const getOpcodeName = (opcode: number): string => {
  return BoksOpcode[opcode] || `UNKNOWN_OPCODE (0x${opcode.toString(16).padStart(2, '0').toUpperCase()})`;
}

const rawHex = ref('C30700020CFFD7')

// Computed value for internal logic, filtered and uppercased
const cleanHex = computed(() => rawHex.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())

const packetData = computed(() => {
  const hexStr = cleanHex.value
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
  if (!takeChars(2, { label: t.value.opcode, color: '#E91E63', key: 'opcode' })) return { segments, error: 'Incomplete Opcode' }

  // 2. Length
  if (!takeChars(2, { label: t.value.length, color: '#4CAF50', key: 'length' })) return { segments, error: 'Incomplete Length' }

  const expectedPayloadBytesRaw = parseInt(hexStr.slice(2, 4), 16) || 0
  const bytes = hexToBytes(hexStr.slice(0, Math.min(cursor, hexStr.length - (hexStr.length % 2))));
  const opcode = bytes[0]

  let packetClass = BoksPacketFactory.getConstructor(opcode)
  const lengthIncludesHeader = (packetClass as any)?.lengthIncludesHeader ?? false
  
  const expectedPayloadBytes = lengthIncludesHeader ? Math.max(0, expectedPayloadBytesRaw - PACKET_HEADER_SIZE) : expectedPayloadBytesRaw
  const expectedPayloadChars = expectedPayloadBytes * 2

  let fields: any[] = []
  if (packetClass) {
    fields = PayloadMapper.getFields(packetClass)
  }

  // 3. Payload
  const actualPayloadChars = Math.min(expectedPayloadChars, hexStr.length - cursor)

  if (actualPayloadChars > 0) {
    const endOfPayload = cursor + actualPayloadChars;
    const colors = ['#2196F3', '#9C27B0', '#FF9800', '#00BCD4', '#3F51B5', '#009688']
    let colorIdx = 0
    let currentByteOffset = 0
    const sortedFields = [...fields].sort((a, b) => a.offset - b.offset)

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
      else if (field.type === 'var_len_hex') {
        const payloadHexPart = hexStr.slice(cursor);
        const payloadBytesPart = hexToBytes(payloadHexPart.length % 2 === 0 ? payloadHexPart : payloadHexPart.slice(0, -1));
        fieldSize = 1 + (payloadBytesPart[0] || 0)
      }
      else if (field.type === 'bit') fieldSize = 1

      const charsAvailable = endOfPayload - cursor
      const charsToTake = Math.min(fieldSize * 2, charsAvailable)

      if (charsToTake > 0) {
        takeChars(charsToTake, { label: field.propertyName, color: colors[colorIdx % colors.length], key: field.propertyName })
        currentByteOffset += Math.ceil(charsToTake / 2)
        colorIdx++
      }
    }

    if (cursor < endOfPayload) {
      takeChars(endOfPayload - cursor, { label: t.value.unmapped, color: '#9E9E9E' })
    }
  }

  // 4. Checksum
  if (cursor < hexStr.length) {
    const checksumCharsAvailable = Math.min(2, hexStr.length - cursor)
    takeChars(checksumCharsAvailable, { label: t.value.checksum, color: '#FFC107', key: 'checksum' })
  }

  // 5. Extra bytes
  if (cursor < hexStr.length) {
    takeChars(hexStr.length - cursor, { label: t.value.extra, color: '#F44336' })
  }

  // Attempt to parse actual packet to get values for the detail table
  let packetObj: any = null
  let parseError = ''

  // Only attempt parsing if we have at least Opcode and Length
  if (hexStr.length >= (PACKET_MIN_HEADER_SIZE * 2)) {
    try {
      // Take only complete bytes (ignore trailing nibble if odd length)
      const completeHex = hexStr.slice(0, hexStr.length - (hexStr.length % 2));
      packetObj = BoksPacketFactory.createFromPayload(hexToBytes(completeHex), { strict: false })
    } catch (e: any) {
      parseError = e.message
    }
  }

  const detailSegments = segments.map(seg => {
    let val = undefined
    if (packetObj) {
        if (seg.key === 'opcode') val = `0x${opcode.toString(16).toUpperCase()} (${getOpcodeName(opcode)})`
        else if (seg.key === 'checksum') {
            if (packetObj.validChecksum === true) val = t.value.valid;
            else if (packetObj.validChecksum === false) val = t.value.invalid;
            else val = t.value.notAvailable;
        }
        else if (seg.key === 'length') val = expectedPayloadBytesRaw
        else if (seg.key && packetObj[seg.key] !== undefined) {
          val = packetObj[seg.key]
        }
    }
    return { ...seg, value: val }
  })

  return { segments: detailSegments, error: parseError, packetObj }
})

</script>

<template>
  <div class="packet-visualizer">
    <div class="input-group">
      <label for="hexInput">{{ t.label }}</label>
      <div class="input-container">
        <div class="visual-input">
            <span
                v-for="(seg, idx) in packetData.segments"
                :key="idx"
                :style="{ color: seg.color }"
            >{{ seg.text.toUpperCase() }}</span>
            <input
                id="hexInput"
                v-model="rawHex"
                type="text"
                :placeholder="t.placeholder"
                class="hex-input-hidden"
                spellcheck="false"
                autocomplete="off"
            />
        </div>
      </div>
    </div>

    <div v-if="packetData?.packetObj && packetData.packetObj.validChecksum === false" class="error-msg">
      ⚠️ {{ t.warning }} {{ t.checksumError }}
    </div>

    <div v-if="packetData?.segments && packetData.segments.length > 0" class="visualization-container">
      <!-- Detail table -->
      <table class="detail-table">
        <thead>
          <tr>
            <th>Hex</th>
            <th>{{ t.opcode }}</th>
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
              <span v-if="seg.value !== undefined" :class="{ 'error-text': seg.key === 'checksum' && packetData.packetObj.validChecksum === false }">
                {{ seg.value }}
              </span>
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

.visual-input {
  position: relative;
  width: 100%;
  padding: 0.8rem 0.9rem;
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  min-height: 3rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.hex-input-hidden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0.8rem 0.9rem;
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 2px;
  border: 1px solid transparent;
  background: transparent;
  color: transparent;
  caret-color: var(--vp-c-text-1);
  z-index: 2;
  text-transform: uppercase;
}
.hex-input-hidden:focus {
    outline: none;
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

.error-text {
    color: var(--vp-c-red-1);
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
