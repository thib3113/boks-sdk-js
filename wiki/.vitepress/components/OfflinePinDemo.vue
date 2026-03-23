<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'
import { generateBoksPin } from '@/crypto/pin-algorithm'
import { hexToBytes } from '@/utils/converters'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

const masterKey = ref('')
const codeType = ref<'master' | 'single-use' | 'multi-use'>('master')
const codeIndex = ref(0)
const generatedPin = ref('')

onMounted(() => {
  if (boksStore.activeMasterKey) {
    masterKey.value = boksStore.activeMasterKey
  }
})

watch(() => boksStore.activeMasterKey, (newKey) => {
  if (newKey && !masterKey.value) {
    masterKey.value = newKey
  }
})

function generate() {
  try {
    if (masterKey.value.length !== 64) {
      alert('Master Key must be 64 hexadecimal characters.')
      return
    }
    const keyBytes = hexToBytes(masterKey.value)
    const pin = generateBoksPin(keyBytes, codeType.value, codeIndex.value)
    generatedPin.value = pin
    boksStore.log(`Generated offline ${codeType.value} PIN at index ${codeIndex.value}: ${pin}`, 'success')
  } catch (err: any) {
    alert(`Generation failed: ${err.message}`)
  }
}

function copyToClipboard() {
  if (generatedPin.value) {
    navigator.clipboard.writeText(generatedPin.value)
    boksStore.log('PIN copied to clipboard.', 'info')
  }
}
</script>

<template>
  <div class="demo-card">
    <div class="card action-card">
      <h3>{{ t.offlinePins.title }}</h3>
      <p class="desc">{{ t.offlinePins.desc }}</p>

      <div class="field">
        <label>{{ t.offlinePins.masterKeyLabel }}</label>
        <div class="value-row">
          <input type="text" v-model="masterKey" maxlength="64" placeholder="0000..." data-testid="offline-master-key-input" />
        </div>
      </div>

      <div class="row" style="margin-top: 1rem;">
        <div class="field" style="flex: 2;">
          <label>{{ t.offlinePins.typeLabel }}</label>
          <select v-model="codeType" class="sim-select">
            <option value="master">{{ t.offlinePins.types.master }}</option>
            <option value="single-use">{{ t.offlinePins.types['single-use'] }}</option>
            <option value="multi-use">{{ t.offlinePins.types['multi-use'] }}</option>
          </select>
        </div>
        <div class="field" style="flex: 1;">
          <label>{{ t.offlinePins.indexLabel }}</label>
          <input type="number" v-model.number="codeIndex" min="0" max="65535" class="sim-input" />
        </div>
      </div>

      <button
        @click="generate"
        :disabled="masterKey.length !== 64"
        class="primary-btn big-btn"
        style="margin-top: 1.5rem;"
        data-testid="generate-offline-pin-button"
      >
        {{ t.offlinePins.generateBtn }}
      </button>

      <div v-if="generatedPin" class="result-panel">
        <strong>{{ t.offlinePins.resultLabel }}</strong>
        <div class="pin-display">
          <span class="pin-value">{{ generatedPin }}</span>
          <button @click="copyToClipboard" class="copy-btn">{{ t.offlinePins.copyBtn }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-card { margin: 1rem 0; }
.card { border: 1px solid var(--vp-c-divider); background-color: var(--vp-c-bg-soft); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
.desc { font-size: 0.85rem; color: var(--vp-c-text-3); margin-bottom: 1.5rem; }
.row { display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 0.5rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field label { font-size: 0.75rem; color: var(--vp-c-text-2); text-transform: uppercase; font-weight: bold; }
.value-row { display: flex; gap: 0.5rem; align-items: center; }
.value-row input, .sim-input, .sim-select { 
  width: 100%; padding: 0.5rem; font-family: monospace; 
  border: 1px solid var(--vp-c-divider); border-radius: 4px; 
  background: var(--vp-c-bg); color: var(--vp-c-text-1); 
}
.sim-select { font-family: inherit; font-size: 0.9rem; }
.big-btn { width: 100%; padding: 0.75rem; font-weight: bold; }
.primary-btn { background: var(--vp-c-brand-1); color: white; border: none; border-radius: 6px; cursor: pointer; }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.result-panel { 
  background: rgba(16, 185, 129, 0.1); border: 1px solid var(--vp-c-green-1); 
  color: var(--vp-c-green-2); padding: 1rem; border-radius: 8px; margin-top: 1.5rem; 
}
.pin-display { display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; }
.pin-value { font-size: 2rem; font-weight: bold; letter-spacing: 4px; font-family: monospace; }
.copy-btn { 
  padding: 0.25rem 0.75rem; font-size: 0.8rem; border-radius: 4px; 
  border: 1px solid var(--vp-c-green-1); background: transparent; 
  color: var(--vp-c-green-1); cursor: pointer; 
}
.copy-btn:hover { background: var(--vp-c-green-1); color: white; }
</style>
