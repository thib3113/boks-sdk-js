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

// Verify PIN feature
const verifyInput = ref('')
const verifyResult = ref<{ type: string, index: number } | null>(null)
const isVerifying = ref(false)
const verifyError = ref('')

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

async function verifyPin() {
  if (masterKey.value.length !== 64 || verifyInput.value.length !== 6) return
  
  isVerifying.value = true
  verifyResult.value = null
  verifyError.value = ''
  
  try {
    const keyBytes = hexToBytes(masterKey.value)
    const target = verifyInput.value.toUpperCase()
    
    // Brute force search across types and first 500 indices
    const types: ('master' | 'single-use' | 'multi-use')[] = ['master', 'single-use', 'multi-use']
    
    for (const type of types) {
      for (let i = 0; i < 500; i++) {
        if (generateBoksPin(keyBytes, type, i) === target) {
          verifyResult.value = { type, index: i }
          isVerifying.value = false
          return
        }
      }
    }
    
    verifyError.value = t.value.offlinePins.verifyNotFound
  } catch (err: any) {
    verifyError.value = err.message
  } finally {
    isVerifying.value = false
  }
}

const firstPins = computed(() => {
  if (masterKey.value.length !== 64) return []
  try {
    const keyBytes = hexToBytes(masterKey.value)
    const results = []
    const types: ('master' | 'single-use' | 'multi-use')[] = ['master', 'single-use', 'multi-use']
    
    for (const type of types) {
      for (let i = 0; i < 10; i++) {
        results.push({
          type,
          index: i,
          pin: generateBoksPin(keyBytes, type, i)
        })
      }
    }
    return results
  } catch {
    return []
  }
})

function copyToClipboard(val: string) {
  if (val) {
    navigator.clipboard.writeText(val)
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
          <button @click="copyToClipboard(generatedPin)" class="copy-btn">{{ t.offlinePins.copyBtn }}</button>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card action-card">
        <h3>{{ t.offlinePins.verifyTitle }}</h3>
        <p class="desc">{{ t.offlinePins.verifyDesc }}</p>
        
        <div class="field">
          <label>{{ t.offlinePins.verifyPinLabel }}</label>
          <input type="text" v-model="verifyInput" maxlength="6" placeholder="123456" class="sim-input" @input="verifyInput = verifyInput.toUpperCase()" />
        </div>

        <button 
          @click="verifyPin" 
          :disabled="masterKey.length !== 64 || verifyInput.length !== 6 || isVerifying"
          class="primary-btn big-btn"
          style="margin-top: 1rem;"
        >
          {{ isVerifying ? t.offlinePins.verifySearching : t.offlinePins.verifyBtn }}
        </button>

        <div v-if="verifyResult" class="verify-success">
          {{ t.offlinePins.verifyFound.replace('{type}', t.offlinePins.types[verifyResult.type as keyof typeof t.offlinePins.types]).replace('{index}', verifyResult.index.toString()) }}
        </div>
        <div v-if="verifyError" class="verify-error">
          {{ verifyError }}
        </div>
      </div>

      <div class="card action-card">
        <h3>{{ t.offlinePins.listTitle }}</h3>
        <div class="pin-table-container">
          <table class="pin-table">
            <thead>
              <tr>
                <th>{{ t.offlinePins.listType }}</th>
                <th>{{ t.offlinePins.listIndex }}</th>
                <th>{{ t.offlinePins.listPin }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in firstPins" :key="item.type + item.index">
                <td class="type-cell">{{ t.offlinePins.types[item.type as keyof typeof t.offlinePins.types] }}</td>
                <td>{{ item.index }}</td>
                <td class="pin-cell" @click="copyToClipboard(item.pin)">{{ item.pin }}</td>
              </tr>
            </tbody>
          </table>
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
.grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 1rem; }
@media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }

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

.verify-success { color: var(--vp-c-green-1); font-weight: bold; margin-top: 1rem; text-align: center; font-size: 0.9rem; }
.verify-error { color: var(--vp-c-danger-1); font-weight: bold; margin-top: 1rem; text-align: center; font-size: 0.9rem; }

.pin-table-container { max-height: 300px; overflow-y: auto; border: 1px solid var(--vp-c-divider); border-radius: 4px; }
.pin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.pin-table th { position: sticky; top: 0; background: var(--vp-c-bg-mute); text-align: left; padding: 0.5rem; border-bottom: 1px solid var(--vp-c-divider); }
.pin-table td { padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--vp-c-divider); font-family: monospace; }
.type-cell { font-family: inherit; font-style: italic; }
.pin-cell { font-weight: bold; color: var(--vp-c-brand-1); cursor: pointer; }
.pin-cell:hover { text-decoration: underline; }
</style>
