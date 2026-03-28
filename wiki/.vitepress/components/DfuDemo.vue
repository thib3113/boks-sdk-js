<template>
  <div class="boks-interactive-demo dfu-demo">
    <div class="demo-header">
      <h3>{{ i18n[locale]?.dfu?.title }}</h3>
      <p class="desc">{{ i18n[locale]?.dfu?.desc }}</p>
    </div>

    <!-- NOT CONNECTED STATE -->
    <div v-if="!boksStore.isConnected" class="warning-banner">
      <p v-html="i18n[locale]?.global?.notConnectedBanner"></p>
    </div>

    <!-- CONNECTED STATE -->
    <div v-else class="demo-body">
      <!-- Normal Mode (Not DFU) -->
      <div v-if="!isDfuMode" class="normal-mode-panel">
        <div class="device-info">
          <div class="info-row">
            <span class="label">{{ i18n[locale]?.dfu?.labels?.device_name }}:</span>
            <span class="value">{{ boksStore.deviceName }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ i18n[locale]?.dfu?.labels?.version }}:</span>
            <span class="value">{{ boksStore.softwareVersion || i18n[locale]?.dfu?.labels?.unknown }} / {{ boksStore.firmwareVersion || i18n[locale]?.dfu?.labels?.unknown }}</span>
          </div>
          <div class="info-row" :class="{'danger': boksStore.batteryLevel < 20}">
            <span class="label">{{ i18n[locale]?.dfu?.labels?.battery }}:</span>
            <span class="value">{{ boksStore.batteryLevel }}%</span>
          </div>
        </div>

        <div v-if="boksStore.batteryLevel < 20" class="battery-warning">
          ⚠️ {{ i18n[locale]?.dfu?.battery_warning }}
        </div>

        <div class="action-panel">
          <button class="boks-btn primary" @click="switchToDfuMode" :disabled="isSwitching">
            <span class="icon">🔄</span> {{ i18n[locale]?.dfu?.switch_to_dfu }}
          </button>
        </div>
      </div>

      <!-- DFU Mode -->
      <div v-else class="dfu-mode-panel">
        <div class="dfu-active-banner">
          🟢 {{ i18n[locale]?.dfu?.dfu_mode_active }}
        </div>

        <div class="device-info dfu-info">
          <div class="info-row">
            <span class="label">{{ i18n[locale]?.dfu?.labels?.device_name }}:</span>
            <span class="value">{{ boksStore.deviceName }}</span>
          </div>
        </div>

        <div class="file-selection">
          <label for="firmware-file" class="file-label">{{ i18n[locale]?.dfu?.firmware_file }}</label>
          <input type="file" id="firmware-file" accept=".zip" @change="onFileChange" :disabled="isFlashing" />
          <div v-if="selectedFile" class="file-details">
            {{ i18n[locale]?.dfu?.logs?.firmware_loaded.replace('{name}', selectedFile.name).replace('{size}', selectedFile.size) }}
          </div>
        </div>

        <div class="action-panel">
          <button class="boks-btn danger" @click="startFlashing" :disabled="!selectedFile || isFlashing">
            <span class="icon">⚡</span> {{ i18n[locale]?.dfu?.start_flashing }}
          </button>
        </div>

        <!-- Progress and Status -->
        <div v-if="isFlashing || progress > 0" class="progress-section">
          <div class="status-text">{{ currentStatusText }}</div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="progress-text">{{ progress.toFixed(1) }}%</div>
        </div>

        <!-- Flashing Warning -->
        <div v-if="isFlashing" class="flashing-warning">
          🚨 {{ i18n[locale]?.dfu?.warnings?.bricking }}
        </div>
      </div>

      <!-- Logs Terminal -->
      <div class="logs-terminal">
        <div class="log-entry" v-for="(log, idx) in dfuLogs" :key="idx" :class="log.type">
          <span class="time">[{{ log.time }}]</span> {{ log.msg }}
        </div>
        <div v-if="dfuLogs.length === 0" class="log-placeholder">
          {{ i18n[locale]?.dfu?.logs?.placeholder }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, shallowRef } from 'vue';
import { useData } from 'vitepress';
import { boksStore } from '../boksStore';
import { i18n } from '../i18n';

const { lang } = useData();
const locale = computed(() => ['en', 'fr'].includes(lang.value) ? lang.value as 'en' | 'fr' : 'en');

// DFU State
const isSwitching = ref(false);
const isFlashing = ref(false);
const progress = ref(0);
const selectedFile = ref<File | null>(null);
const dfuLogs = ref<{ time: string, msg: string, type: 'info' | 'error' | 'success' | 'warning' }[]>([]);
const currentStatusText = ref('');

// Dynamic Import for Web Bluetooth DFU to support SSR
const SecureDfuRef = shallowRef<any>(null);

onMounted(async () => {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    try {
      const { SecureDfu } = await import('@thib3113/web-bluetooth-dfu');
      SecureDfuRef.value = SecureDfu;
    } catch (e) {
      console.error("Failed to load @thib3113/web-bluetooth-dfu", e);
    }
  }
});

const isDfuMode = computed(() => {
  return boksStore.deviceName.includes('DFU Mode') ||
         boksStore.deviceName.startsWith('DfuTarg') ||
         boksStore.deviceName.startsWith('Boks_DFU');
});

const addLog = (msg: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
  dfuLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    msg,
    type
  });
};

const switchToDfuMode = async () => {
  if (!boksStore.dfuDevice) {
    addLog("No device connected.", "error");
    return;
  }

  isSwitching.value = true;
  addLog(i18n[locale.value]?.dfu?.status?.preparing || 'Preparing...', "info");

  try {
    const device = boksStore.dfuDevice;
    if (!device.gatt?.connected) {
      await device.gatt?.connect();
    }

    // Service DFU: 0000fe59-0000-1000-8000-00805f9b34fb
    // Characteristic DFU Control Point: 8ec90001-f315-4f60-9fb8-838830daea50
    const service = await device.gatt?.getPrimaryService('0000fe59-0000-1000-8000-00805f9b34fb');
    if (!service) {
        throw new Error("DFU Service not found on this device.");
    }
    const characteristic = await service.getCharacteristic('8ec90001-f315-4f60-9fb8-838830daea50');

    addLog(i18n[locale.value]?.dfu?.status?.rebooting || 'Rebooting...', "info");

    // Write 0x01 without response
    const data = new Uint8Array([0x01]);
    await characteristic.writeValueWithoutResponse(data);

    addLog("Reboot command sent. Device will disconnect.", "success");
    // boksStore handles disconnection gracefully usually, but let's disconnect to be sure
    await boksStore.disconnect();

  } catch (e: any) {
    addLog(`Failed to switch to DFU mode: ${e.message}`, "error");
  } finally {
    isSwitching.value = false;
  }
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    addLog(i18n[locale.value]?.dfu?.logs?.firmware_loaded.replace('{name}', selectedFile.value.name).replace('{size}', selectedFile.value.size.toString()) || 'Loaded', "success");
  }
};

const mapDfuError = (error: any): string => {
  const errorMsg = error.message || String(error);
  if (errorMsg.includes('0x0B') || errorMsg.includes('Invalid object')) {
    return i18n[locale.value]?.dfu?.error_invalid_firmware || 'Invalid firmware';
  }
  if (errorMsg.includes('0x0D') || errorMsg.includes('Not supported')) {
    return i18n[locale.value]?.dfu?.error_wrong_pcb || 'Wrong PCB';
  }
  return errorMsg;
};

const startFlashing = async () => {
  if (!selectedFile.value || !boksStore.dfuDevice || !SecureDfuRef.value) {
    addLog("Missing file, device, or DFU library.", "error");
    return;
  }

  isFlashing.value = true;
  progress.value = 0;
  currentStatusText.value = i18n[locale.value]?.dfu?.status?.flashing || 'Flashing...';
  addLog(i18n[locale.value]?.dfu?.status?.flashing || 'Flashing...', "info");

  try {
    const arrayBuffer = await selectedFile.value.arrayBuffer();

    const dfu = new SecureDfuRef.value(boksStore.dfuDevice);

    dfu.addEventListener('progress', (event: any) => {
      if (event && typeof event.progress === 'number') {
         progress.value = event.progress * 100;
      } else if (event && event.currentBytes !== undefined && event.totalBytes !== undefined) {
         progress.value = (event.currentBytes / event.totalBytes) * 100;
      }
    });

    dfu.addEventListener('log', (event: any) => {
        if(event && event.message) {
            addLog(`DFU Log: ${event.message}`, 'info');
        }
    });

    await dfu.update(arrayBuffer);

    progress.value = 100;
    currentStatusText.value = i18n[locale.value]?.dfu?.status?.success || 'Success';
    addLog(i18n[locale.value]?.dfu?.status?.success || 'Success', "success");

    // Disconnect after successful update
    await boksStore.disconnect();

  } catch (error: any) {
    const mappedErrorMsg = mapDfuError(error);
    currentStatusText.value = i18n[locale.value]?.dfu?.status?.error || 'Error';
    addLog(`DFU Error: ${mappedErrorMsg}`, "error");
    addLog(`Raw Error: ${error.message || String(error)}`, "warning");
  } finally {
    isFlashing.value = false;
  }
};
</script>

<style scoped>
.dfu-demo {
  margin-top: 2rem;
}

.normal-mode-panel, .dfu-mode-panel {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--vp-c-divider);
}

.dfu-mode-panel {
  border-color: var(--vp-c-brand);
}

.dfu-active-banner {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--vp-c-brand);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-weight: 600;
  text-align: center;
}

.device-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  flex-direction: column;
}

.info-row .label {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.25rem;
}

.info-row .value {
  font-weight: 600;
  font-family: var(--vp-font-family-mono);
}

.info-row.danger .value {
  color: var(--vp-c-danger-1);
}

.battery-warning {
  background-color: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border-left: 4px solid #ca8a04;
}

.dark .battery-warning {
  color: #facc15;
}

.file-selection {
  margin-bottom: 1.5rem;
}

.file-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.file-details {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.action-panel {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.boks-btn.danger {
  background-color: var(--vp-c-danger-1);
  color: white;
}

.boks-btn.danger:hover:not(:disabled) {
  background-color: var(--vp-c-danger-2);
}

.progress-section {
  margin-bottom: 1.5rem;
}

.status-text {
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-align: center;
}

.progress-bar-container {
  height: 8px;
  background-color: var(--vp-c-default-soft);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background-color: var(--vp-c-brand);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.flashing-warning {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--vp-c-danger-1);
  padding: 0.75rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.logs-terminal {
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 1rem;
  height: 200px;
  overflow-y: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  color: #d4d4d4;
  border: 1px solid var(--vp-c-divider);
}

.log-entry {
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.log-entry .time {
  color: #858585;
  margin-right: 0.5rem;
}

.log-entry.info { color: #d4d4d4; }
.log-entry.success { color: #4ade80; }
.log-entry.warning { color: #facc15; }
.log-entry.error { color: #f87171; }

.log-placeholder {
  color: #858585;
  font-style: italic;
  text-align: center;
  margin-top: 4rem;
}
</style>
