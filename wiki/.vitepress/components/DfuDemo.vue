<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { i18n } from '../i18n'
import { boksStore } from '../boksStore'
import { SecureDfu } from '@thib3113/web-bluetooth-dfu'
import { WebBluetoothTransport } from '../../src/client/WebBluetoothTransport'

const lang = ref(typeof navigator !== 'undefined' && navigator.language.startsWith('fr') ? 'fr' : 'en')
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

const dfuState = ref<'idle' | 'connected_normal' | 'connected_dfu' | 'flashing' | 'success' | 'error'>('idle')
const logs = ref<string[]>([])
const progress = ref(0)
const fileName = ref<string | null>(null)
const fileBuffer = ref<ArrayBuffer | null>(null)

const log = (msg: string) => {
  console.log(msg)
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
}

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    fileBuffer.value = e.target?.result as ArrayBuffer
    log(t.value.dfu.logs.firmware_loaded.replace('{name}', file.name).replace('{size}', fileBuffer.value!.byteLength.toString()))
  }
  reader.readAsArrayBuffer(file)
}

watch(() => boksStore.isConnected, (connected) => {
  if (connected) {
    checkConnectionMode()
  } else {
    dfuState.value = 'idle'
  }
}, { immediate: true })

const checkConnectionMode = () => {
  if (!boksStore.controller || !boksStore.controller.client.transport) return

  const transport = boksStore.controller.client.transport as WebBluetoothTransport
  const device = transport.device

  if (!device) return

  const deviceNameStr = device.name || 'Unknown'

  if (deviceNameStr.startsWith('DfuTarg') || deviceNameStr.startsWith('Boks_DFU')) {
    dfuState.value = 'connected_dfu'
    log(t.value.dfu.status.device_in_dfu)
  } else {
    dfuState.value = 'connected_normal'
  }
}

const rebootToDfu = async () => {
  try {
    log(t.value.dfu.status.rebooting)
    if (!boksStore.controller || !boksStore.controller.client.transport) return
    const transport = boksStore.controller.client.transport as WebBluetoothTransport
    const device = transport.device
    if (!device) return

    const dfuService = await device.gatt!.getPrimaryService('0000fe59-0000-1000-8000-00805f9b34fb')
    const dfuChar = await dfuService.getCharacteristic('8ec90001-f315-4f60-9fb8-838830daea50')
    await dfuChar.writeValueWithoutResponse(new Uint8Array([0x01]))

    // boksStore might auto-disconnect if it detects a link loss. We do not explicitly force store disconnect because DFU disconnect handles it anyway.
    dfuState.value = 'idle'
    log('Device disconnected, ready to reconnect in DFU mode.')
  } catch (e: any) {
    log(`Failed to reboot to DFU: ${e.message}`)
  }
}

const flashFirmware = async () => {
  if (!fileBuffer.value) return
  if (!boksStore.controller || !boksStore.controller.client.transport) return
  const transport = boksStore.controller.client.transport as WebBluetoothTransport
  const device = transport.device
  if (!device) return

  try {
    dfuState.value = 'flashing'
    log(t.value.dfu.status.flashing)
    progress.value = 0

    const dfu = new SecureDfu()

    dfu.addEventListener('progress', (e: any) => {
      progress.value = e.object.progress * 100
    })

    dfu.addEventListener('log', (e: any) => {
      log(`DFU: ${e.object.message}`)
    })

    await dfu.update(device, fileBuffer.value)

    dfuState.value = 'success'
    log(t.value.dfu.status.success)
  } catch (e: any) {
    dfuState.value = 'error'

    // Decode DFU errors
    let errorMsg = e.message
    if (errorMsg.includes('0x0B')) errorMsg += ' (Le fichier de firmware est invalide ou corrompu pour ce modèle)'
    if (errorMsg.includes('0x0C')) errorMsg += ' (Authentication failed - Not signed by Boks)'
    if (errorMsg.includes('0x0D')) errorMsg += ' (Ce firmware n\'est pas compatible avec la version matérielle de votre Boks)'
    if (errorMsg.includes('0x0E')) errorMsg += ' (Downgrade blocked)'

    log(`${t.value.dfu.status.error}: ${errorMsg}`)
  }
}
</script>

<template>
  <div class="boks-demo-container boks-theme">

    <div v-if="!boksStore.isConnected" class="warning-box">
        <span v-html="t.global.notConnectedWarning"></span>
    </div>

    <div class="demo-content">
      <div class="panel">
        <div class="file-selector">
          <label class="file-label">
            {{ t.dfu.selectFile }}
            <input type="file" accept=".zip" @change="onFileChange" />
          </label>
          <span v-if="fileName" class="file-name">{{ fileName }}</span>
        </div>

        <div class="device-panel" v-if="boksStore.isConnected">
          <div class="info-row">
            <span class="label">{{ t.dfu.labels.device_name }}:</span>
            <span class="value">{{ boksStore.deviceName || t.dfu.labels.unknown }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ t.dfu.labels.battery }}:</span>
            <span class="value" :class="{ 'warning-text': boksStore.batteryLevel < 20 }">{{ boksStore.batteryLevel }}%</span>
          </div>
          <div class="info-row">
            <span class="label">{{ t.dfu.labels.version }}:</span>
            <span class="value">{{ boksStore.softwareVersion || t.dfu.labels.not_available }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ t.dfu.labels.hw }}:</span>
            <span class="value">{{ boksStore.firmwareVersion || t.dfu.labels.not_available }}</span>
          </div>
        </div>

        <div class="action-buttons" v-if="boksStore.isConnected">
          <button v-if="dfuState === 'connected_normal'" class="btn warning" @click="rebootToDfu">
            {{ t.dfu.buttons.prepare }}
          </button>

          <button v-if="dfuState === 'connected_dfu'" class="btn primary" :disabled="!fileBuffer" @click="flashFirmware">
            {{ t.dfu.buttons.flash }}
          </button>
        </div>

        <div v-if="dfuState === 'flashing' || progress > 0" class="progress-container">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          <span class="progress-text">{{ Math.round(progress) }}%</span>
        </div>

        <div v-if="boksStore.isConnected && boksStore.batteryLevel < 20" class="warning-box">
          ⚠️ Battery level is low! Please change batteries before updating firmware.
        </div>
      </div>

      <div class="log-panel">
        <h3>Logs</h3>
        <div class="log-box">
          <div v-for="(log, i) in logs" :key="i" class="log-entry">{{ log }}</div>
          <div v-if="logs.length === 0" class="log-placeholder">{{ t.dfu.logs.placeholder }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boks-demo-container {
  max-width: 800px;
  margin: 0 auto;
}
.header {
  margin-bottom: 24px;
}
.panel {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}
.file-selector {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.file-label {
  background: var(--vp-c-brand-1);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  font-weight: 500;
  transition: background 0.2s;
}
.file-label:hover {
  background: var(--vp-c-brand-2);
}
.file-label input {
  display: none;
}
.file-name {
  color: var(--vp-c-text-2);
  font-family: monospace;
}
.device-panel {
  background: var(--vp-c-bg-mute);
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 24px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.info-row:last-child {
  margin-bottom: 0;
}
.label {
  color: var(--vp-c-text-2);
}
.value {
  font-weight: 500;
  color: var(--vp-c-text-1);
}
.warning-text {
  color: var(--vp-c-danger-1);
  font-weight: bold;
}
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.primary {
  background: var(--vp-c-brand-1);
  color: white;
}
.btn.primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}
.btn.warning {
  background: var(--vp-c-warning-1);
  color: var(--vp-c-bg);
}
.btn.warning:hover:not(:disabled) {
  background: var(--vp-c-warning-2);
}
.progress-container {
  height: 20px;
  background: var(--vp-c-bg-mute);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  margin-bottom: 16px;
}
.progress-bar {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.3s ease;
}
.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--vp-c-text-1);
  font-size: 12px;
  font-weight: bold;
  mix-blend-mode: difference;
}
.warning-box {
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-weight: 500;
}
.log-panel {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
}
.log-panel h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
}
.log-box {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 6px;
  height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 13px;
}
.log-entry {
  margin-bottom: 4px;
  line-height: 1.4;
}
.log-placeholder {
  color: #666;
  font-style: italic;
}
</style>
