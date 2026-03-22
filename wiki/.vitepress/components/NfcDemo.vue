<script setup lang="ts">
import { ref, computed } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'
import type { NfcScanResult } from '../../../src/client/BoksController'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

// Scan State
const isScanning = ref(false)
const scanResult = ref<NfcScanResult | null>(null)
const scanStatus = ref<{ message: string, type: 'info' | 'success' | 'warning' | 'error' } | null>(null)
const isRegistering = ref(false)

// Unregister State
const unregisterUid = ref('')
const isUnregistering = ref(false)

// Computed requirement check (basic)
const isSupported = computed(() => {
  if (!boksStore.isConnected || !boksStore.controller) return false
  const hwVersion = boksStore.controller.hardwareInfo?.hardwareVersion || '0.0'
  return parseFloat(hwVersion) >= 4.0
})

async function startScan() {
  if (!boksStore.controller || !boksStore.isConnected) {
    alert(t.value.global.pleaseConnectFirst)
    return
  }

  isScanning.value = true
  scanResult.value = null
  scanStatus.value = { message: t.value.nfc.scanningBtn, type: 'info' }

  try {
    // Start scan with 6s timeout
    const result = await boksStore.controller.scanNFCTags(6000)
    scanResult.value = result
    scanStatus.value = { message: `${t.value.nfc.scanSuccess} UID: ${result.tagId}`, type: 'success' }
    boksStore.log(`NFC Scan Success: ${result.tagId}`, 'success')
  } catch (err: any) {
    const errorMsg = err.message || 'Unknown error'
    if (errorMsg.includes('NFC Scan timed out')) {
      scanStatus.value = { message: t.value.nfc.scanTimeout, type: 'warning' }
      boksStore.log('NFC Scan Timed Out', 'warning')
    } else if (errorMsg.includes('already exists')) {
      scanStatus.value = { message: t.value.nfc.scanAlreadyExists, type: 'warning' }
      boksStore.log('NFC Tag Already Exists', 'warning')
    } else {
      scanStatus.value = { message: t.value.nfc.scanError.replace('{error}', errorMsg), type: 'error' }
      boksStore.log(`NFC Scan Error: ${errorMsg}`, 'error')
    }
  } finally {
    isScanning.value = false
  }
}

async function registerScannedTag() {
  if (!scanResult.value || !boksStore.controller) return

  isRegistering.value = true
  try {
    await scanResult.value.register()
    boksStore.log(t.value.nfc.registerSuccess.replace('{uid}', scanResult.value.tagId), 'success')
    scanStatus.value = { message: t.value.nfc.registerSuccess.replace('{uid}', scanResult.value.tagId), type: 'success' }
    scanResult.value = null // Clear after success
  } catch (err: any) {
    boksStore.log(`Register NFC Error: ${err.message}`, 'error')
    scanStatus.value = { message: t.value.nfc.registerError.replace('{error}', err.message), type: 'error' }
  } finally {
    isRegistering.value = false
  }
}

async function unregisterTag() {
  if (!boksStore.controller || !boksStore.isConnected) {
    alert(t.value.global.pleaseConnectFirst)
    return
  }

  if (!unregisterUid.value || unregisterUid.value.trim() === '') {
    boksStore.log(t.value.nfc.uidRequired, 'warning')
    return
  }

  isUnregistering.value = true
  try {
    const uid = unregisterUid.value.trim()
    await boksStore.controller.unregisterNfcTag(uid)
    boksStore.log(t.value.nfc.unregisterSuccess.replace('{uid}', uid), 'success')
    unregisterUid.value = '' // clear input
  } catch (err: any) {
    boksStore.log(`Unregister NFC Error: ${err.message}`, 'error')
    alert(t.value.nfc.unregisterError.replace('{error}', err.message))
  } finally {
    isUnregistering.value = false
  }
}
</script>

<template>
  <div class="demo-card">
    <div v-if="!boksStore.isConnected" class="warning-box" v-html="t.global.notConnectedWarning"></div>
    <div v-else-if="!isSupported" class="warning-box">
      {{ t.nfc.unsupported }}
    </div>

    <div class="card" :class="{ disabled: !boksStore.isConnected || !isSupported }">
      <h3>{{ t.nfc.title }}</h3>
      <p class="desc">{{ t.nfc.desc }}</p>

      <!-- 1. Scan Section -->
      <div class="section">
        <h4>{{ t.nfc.scanTitle }}</h4>
        <p class="desc-small">{{ t.nfc.scanDesc }}</p>

        <div class="control-row">
          <button
            @click="startScan"
            :disabled="!boksStore.isConnected || !isSupported || isScanning"
            class="primary-btn"
          >
            {{ isScanning ? t.nfc.scanningBtn : t.nfc.scanBtn }}
          </button>
        </div>

        <div v-if="scanStatus" :class="['status-box', scanStatus.type]">
          {{ scanStatus.message }}
        </div>

        <div v-if="scanResult" class="register-action">
          <button
            @click="registerScannedTag"
            :disabled="isRegistering"
            class="success-btn"
          >
            {{ isRegistering ? '...' : t.nfc.registerBtn }}
          </button>
        </div>
      </div>

      <hr class="divider" />

      <!-- 2. Unregister Section -->
      <div class="section">
        <h4>{{ t.nfc.unregisterTitle }}</h4>
        <p class="desc-small">{{ t.nfc.unregisterDesc }}</p>

        <div class="control-row">
          <div class="input-group">
            <label>{{ t.nfc.uidLabel }}</label>
            <input
              v-model="unregisterUid"
              type="text"
              :placeholder="t.nfc.uidPlaceholder"
              :disabled="!boksStore.isConnected || !isSupported || isUnregistering"
            >
          </div>

          <button
            @click="unregisterTag"
            :disabled="!boksStore.isConnected || !isSupported || isUnregistering || !unregisterUid"
            class="danger-btn"
          >
            {{ isUnregistering ? t.nfc.unregisteringBtn : t.nfc.unregisterBtn }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-card { margin: 1rem 0; }
.card { border: 1px solid var(--vp-c-divider); background-color: var(--vp-c-bg-soft); border-radius: 8px; padding: 1.5rem; transition: opacity 0.3s; }
.card.disabled { opacity: 0.6; pointer-events: none; }
.warning-box { background-color: rgba(239, 68, 68, 0.1); color: var(--vp-c-red-1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--vp-c-red-1); }
.desc { font-size: 0.9rem; color: var(--vp-c-text-2); margin-bottom: 1.5rem; }
.desc-small { font-size: 0.85rem; color: var(--vp-c-text-2); margin-bottom: 0.8rem; }
.section { margin-bottom: 1.5rem; }
.section h4 { margin-top: 0; margin-bottom: 0.5rem; }
.control-row { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
.input-group { display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1; max-width: 300px; }
.input-group label { font-size: 0.8rem; font-weight: 600; color: var(--vp-c-text-2); }
.input-group input { padding: 0.5rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-family: monospace; font-size: 1rem; width: 100%; }
.divider { margin: 1.5rem 0; border: none; border-top: 1px solid var(--vp-c-divider); }

.primary-btn { background-color: var(--vp-c-brand-1); color: white; padding: 0.5rem 1rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 600; }
.primary-btn:disabled { background-color: var(--vp-c-gray-1); cursor: not-allowed; opacity: 0.7; }
.danger-btn { background-color: var(--vp-c-red-1); color: white; padding: 0.5rem 1rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 600; }
.danger-btn:disabled { background-color: var(--vp-c-gray-1); cursor: not-allowed; opacity: 0.7; }
.success-btn { background-color: var(--vp-c-green-1); color: white; padding: 0.5rem 1rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 600; }

.status-box { margin-top: 1rem; padding: 0.8rem; border-radius: 4px; font-size: 0.9rem; font-weight: 500; }
.status-box.info { background-color: var(--vp-c-bg-alt); color: var(--vp-c-text-1); border: 1px solid var(--vp-c-divider); }
.status-box.success { background-color: rgba(16, 185, 129, 0.1); color: var(--vp-c-green-1); border: 1px solid var(--vp-c-green-1); }
.status-box.warning { background-color: rgba(245, 158, 11, 0.1); color: var(--vp-c-yellow-1); border: 1px solid var(--vp-c-yellow-1); }
.status-box.error { background-color: rgba(239, 68, 68, 0.1); color: var(--vp-c-red-1); border: 1px solid var(--vp-c-red-1); }

.register-action { margin-top: 0.8rem; }
</style>
