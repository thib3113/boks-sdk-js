<script setup lang="ts">import { ref, computed } from 'vue'
import { useData } from 'vitepress'
import { i18n } from '../i18n'
import { BoksPacketFactory } from '../../../src/protocol/BoksPacketFactory'
import { PayloadMapper } from '../../../src/protocol/decorators/PayloadMapper'
import { BoksOpcode } from '../../../src/protocol/constants'
import { hexToBytes } from '../../../src/utils/converters'

const { lang } = useData()

const t = computed(() => (i18n[lang.value as keyof typeof i18n] || i18n.en).visualizer)

const getOpcodeName = (opcode: number): string => {
  return BoksOpcode[opcode] || `UNKNOWN_OPCODE (0x${opcode.toString(16).padStart(2, '0').toUpperCase()})`;
}

const rawHex = ref('c30700020cffd7')

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
  if (!takeChars(2, { label: t.value.opcode, color: '#E91E63' })) return { segments, error: t.value.incompleteOpcode }

  // 2. Length
  if (!takeChars(2, { label: t.value.length, color: '#4CAF50' })) return { segments, error: t.value.incompleteLength }

  const bytes = hexToBytes(hexStr.slice(0, cursor + (hexStr.length - cursor - (hexStr.length % 2))))
  const opcode = bytes[0]

  let packetClass = BoksPacketFactory.getConstructor(opcode)
  let fields: any[] = []
  if (packetClass) {
    fields = PayloadMapper.getFields(packetClass)
  }

  const lengthByte = parseInt(hexStr.slice(2, 4), 16) || 0
  const lengthIncludesHeader = packetClass?.lengthIncludesHeader ?? false
  const expectedPayloadBytes = lengthIncludesHeader ? Math.max(0, lengthByte - 3) : lengthByte
  const expectedPayloadChars = expectedPayloadBytes * 2

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
        if (!takeChars(gapChars, { label: t.value.unknownPadding, color: '#9E9E9E' })) break;
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
      takeChars(endOfPayload - cursor, { label: t.value.unmappedPayload, color: '#9E9E9E' })
    }
  }

  // 4. Checksum
  if (cursor < hexStr.length) {
    const checksumCharsAvailable = Math.min(2, hexStr.length - cursor)
    takeChars(checksumCharsAvailable, { label: t.value.checksum, color: '#FFC107' })
  } else {
    segments.push({ text: '??', label: t.value.missingChecksum, color: '#FFC107' })
  }

  // 5. Extra bytes
  if (cursor < hexStr.length) {
    takeChars(hexStr.length - cursor, { label: t.value.extraBytes, color: '#F44336' })
  }

  // Attempt to parse actual packet to get values for the detail table
  let packetObj: any = null
  let parseError = ''

  if (hexStr.length >= 4 && hexStr.length % 2 === 0) {
    try {
      let packetHex = hexStr;
      let missingChecksum = false;
      const expectedTotalHexLength = lengthIncludesHeader ? (lengthByte) * 2 : (lengthByte + 3) * 2;

      if (hexStr.length === expectedTotalHexLength - 2) {
        missingChecksum = true;
        packetHex += '00';
      }

      try {
         packetObj = BoksPacketFactory.createFromPayload(hexToBytes(packetHex))
      } catch (e: any) {
         if (e.message === 'Invalid checksum') {
            if (packetClass) {
               packetObj = new (packetClass as any)({}, hexToBytes(packetHex));
               Object.assign(packetObj, PayloadMapper.parse(packetClass, hexToBytes(packetHex)));
            }
            parseError = missingChecksum ? t.value.missingChecksum : t.value.invalidChecksum;
         } else {
            throw e;
         }
      }
    } catch (e: any) {
      parseError = e.message;
      if (parseError === 'Packet length too short based on length byte') parseError = t.value.lengthTooShort;
      if (parseError === 'Invalid checksum') parseError = t.value.invalidChecksum;
    }
  } else if (hexStr.length % 2 !== 0) {
    parseError = t.value.incompleteHex
  } else if (hexStr.length < 6) {
    parseError = t.value.tooShort
  }

  const detailSegments = segments.map(seg => {
    let val = undefined
    if (packetObj && seg.label && packetObj[seg.label] !== undefined) {
      val = packetObj[seg.label]
    }
    if (seg.label === t.value.opcode) {
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
      <label for="hexInput">{{ t.rawPacket }}</label>
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
        <textarea
          id="hexInput"
          ref="inputRef"
          v-model="rawHexInput"
          @scroll="handleScroll"
          :placeholder="`${t.eg} c30700020cffd7`"
          class="hex-input"
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
        ></textarea>
      </div>
    </div>

    <div v-if="packetData?.error" class="error-msg">
      {{ t.warning }} {{ packetData.error }}
    </div>

    <div v-if="packetData?.segments && packetData.segments.length > 0" class="visualization-container">


      <!-- Detail table -->
      <table class="detail-table">
        <thead>
          <tr>
            <th>{{ t.hex }}</th>
            <th>{{ t.label }}</th>
            <th>{{ t.value }}</th>
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
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.input-group {
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.input-container {
  position: relative;
  width: 100%;
  font-family: "Roboto Mono", monospace;
  font-size: 1.2rem;
  line-height: 1.4;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  min-height: 3rem;
  overflow: hidden;
}

.input-overlay {
  margin: 0;
  border: 0;
  background: none;
  box-sizing: inherit;
  display: inherit;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-variant-ligatures: inherit;
  font-weight: bold;
  letter-spacing: 2px;
  line-height: inherit;
  text-indent: inherit;
  text-rendering: inherit;
  text-transform: uppercase;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
  position: relative;
  pointer-events: none;
  padding: 0.8rem 0.9rem;
  color: var(--vp-c-text-1);
}

.input-overlay span {
  transition: color 0.2s;
}

.hex-input {
  margin: 0;
  border: 0;
  background: none;
  box-sizing: inherit;
  display: inherit;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-variant-ligatures: inherit;
  font-weight: bold;
  letter-spacing: 2px;
  line-height: inherit;
  text-indent: inherit;
  text-rendering: inherit;
  text-transform: uppercase;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  resize: none;
  color: inherit;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -webkit-text-fill-color: transparent;
  padding: 0.8rem 0.9rem;
  outline: none;
  caret-color: var(--vp-c-text-1);
  z-index: 2;
}

.hex-input::selection {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  -webkit-text-fill-color: initial;
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
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
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
