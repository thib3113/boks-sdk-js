<template>
  <div class="boks-demo-container">
    <div class="demo-card">
      <h3>{{ i18n[lang].dfu.title }}</h3>
      <p class="desc">{{ i18n[lang].dfu.desc }}</p>

      <div class="control-group">
        <label>{{ i18n[lang].dfu.selectFile }}</label>
        <input type="file" accept=".zip" @change="onFileChange" :disabled="isFlashing" />
      </div>

      <div v-if="deviceInfo" class="device-info">
        <h4>{{ i18n[lang].dfu.deviceInfo }}</h4>
        <ul>
          <li><strong>HW:</strong> {{ deviceInfo.hwVersion }}</li>
          <li><strong>SW:</strong> {{ deviceInfo.swVersion }}</li>
          <li><strong>Battery:</strong> {{ deviceInfo.battery }}%</li>
        </ul>
      </div>

      <div class="button-group">
        <button
          v-if="!isConnected"
          @click="connectDevice"
          class="btn-primary"
          :disabled="isFlashing || !firmwareFile"
        >
          {{ i18n[lang].dfu.connectBtn }}
        </button>
        <button
          v-if="isConnected && !isFlashing"
          @click="startDfu"
          class="btn-warning"
          :disabled="!firmwareFile"
        >
          {{ i18n[lang].dfu.flashBtn }}
        </button>
      </div>

      <div v-if="isFlashing" class="progress-container">
        <p>{{ i18n[lang].dfu.progress }}: {{ progress }}%</p>
        <progress :value="progress" max="100"></progress>
      </div>

      <div v-if="logs.length" class="logger-box">
        <div v-for="(log, idx) in logs" :key="idx" class="log-entry">
          <span class="time">{{ log.time }}</span>
          <span :class="['msg', log.type]">{{ log.msg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useData } from 'vitepress';
import { i18n } from '../i18n';

const { lang } = useData();

const firmwareFile = ref<File | null>(null);
const firmwareBuffer = ref<ArrayBuffer | null>(null);
const isConnected = ref(false);
const isFlashing = ref(false);
const progress = ref(0);
const logs = ref<{ time: string; msg: string; type: string }[]>([]);
const bluetoothDevice = ref<BluetoothDevice | null>(null);

const deviceInfo = ref<{
  hwVersion: string;
  swVersion: string;
  battery: number | string;
} | null>(null);

function addLog(msg: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    msg,
    type,
  });
  // Keep last 50 logs
  if (logs.value.length > 50) logs.value.shift();
}

async function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    firmwareFile.value = target.files[0];
    firmwareBuffer.value = await firmwareFile.value.arrayBuffer();
    addLog(`File loaded: ${firmwareFile.value.name}`, 'info');
  }
}

async function connectDevice() {
  try {
    addLog('Requesting Bluetooth Device...', 'info');
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'Boks-' }],
      optionalServices: [0x180a, 0x180f, 0xfe59, '0000fe59-0000-1000-8000-00805f9b34fb'],
    });

    addLog(`Connected to ${device.name}`, 'success');
    bluetoothDevice.value = device;

    const server = await device.gatt?.connect();
    if (!server) throw new Error('Could not connect to GATT server');

    // Read Device Info
    let hwVersion = 'Unknown';
    let swVersion = 'Unknown';
    let battery = 'Unknown';

    try {
      const infoService = await server.getPrimaryService(0x180a);
      const hwChar = await infoService.getCharacteristic(0x2a27);
      const swChar = await infoService.getCharacteristic(0x2a28);

      const hwVal = await hwChar.readValue();
      const swVal = await swChar.readValue();

      const decoder = new TextDecoder('utf-8');
      hwVersion = decoder.decode(hwVal);
      swVersion = decoder.decode(swVal);
    } catch (e) {
      addLog('Could not read Device Info (0x180A)', 'error');
    }

    try {
      const batService = await server.getPrimaryService(0x180f);
      const batChar = await batService.getCharacteristic(0x2a19);
      const batVal = await batChar.readValue();
      battery = batVal.getUint8(0).toString();
    } catch (e) {
      addLog('Could not read Battery Level (0x180F)', 'error');
    }

    deviceInfo.value = { hwVersion, swVersion, battery };
    isConnected.value = true;
  } catch (err: any) {
    addLog(`Connection failed: ${err.message}`, 'error');
  }
}

async function triggerDfuMode(server: BluetoothRemoteGATTServer) {
  addLog('Triggering DFU Mode...', 'info');
  try {
    // 0xFE59 is DFU_SERVICE_UUID
    // DFU_CONTROL_POINT is 8ec90001-f315-4f60-9fb8-838830daea50
    const service = await server.getPrimaryService(0xfe59);
    const char = await service.getCharacteristic('8ec90001-f315-4f60-9fb8-838830daea50');

    // Write 0x01 to trigger DFU
    await char.writeValue(new Uint8Array([0x01]));
    addLog('DFU Mode triggered. Waiting for device to reboot...', 'success');

    // Wait for disconnect
    await new Promise((resolve) => {
      if (!bluetoothDevice.value) resolve(true);
      else bluetoothDevice.value.addEventListener('gattserverdisconnected', resolve, { once: true });
      setTimeout(resolve, 5000); // timeout just in case
    });

    addLog('Device disconnected. Ready for DFU flash.', 'info');
  } catch (err: any) {
    addLog(`Failed to trigger DFU mode: ${err.message}`, 'error');
    throw err;
  }
}

async function startDfu() {
  if (!firmwareBuffer.value) {
    addLog('No firmware file loaded', 'error');
    return;
  }

  isFlashing.value = true;
  progress.value = 0;

  try {
    if (bluetoothDevice.value?.gatt?.connected) {
      await triggerDfuMode(bluetoothDevice.value.gatt);
    }

    // Load from unpkg
    const dfuModule = await import('https://unpkg.com/@thib3113/web-bluetooth-dfu/dist/secure-dfu.mjs' /* @vite-ignore */);
    const SecureDfu = dfuModule.SecureDfu;
    const SecureDfuPackage = dfuModule.SecureDfuPackage;

    addLog('Parsing DFU Package...', 'info');
    const dfuPkg = new SecureDfuPackage(firmwareBuffer.value);
    await dfuPkg.load();
    const manifest = dfuPkg.manifest;
    if (!manifest) throw new Error('Invalid DFU package: No manifest');

    let initData: ArrayBuffer | null = null;
    let firmwareData: ArrayBuffer | null = null;

    if (manifest.application) {
      initData = await dfuPkg.getBaseImage();
      firmwareData = await dfuPkg.getAppImage();
      addLog('Application image found in package.', 'info');
    } else {
      throw new Error('Only application updates are supported in this demo');
    }

    if (!initData || !firmwareData) {
      throw new Error('Failed to extract images from DFU package');
    }

    addLog('Initializing Secure DFU...', 'info');
    const dfu = new SecureDfu();
    dfu.enableSmartSpeed = true;

    dfu.addEventListener(SecureDfu.EVENT_LOG, (event: any) => {
      addLog(`[DFU] ${event.message}`, 'info');
    });

    dfu.addEventListener(SecureDfu.EVENT_PROGRESS, (event: any) => {
      const current = event.currentBytes || 0;
      const total = event.totalBytes || 1;
      progress.value = Math.round((current / total) * 100);
    });

    addLog('Please select the Boks device in DFU mode (DfuTarg)...', 'warning');

    const dfuDevice = await dfu.requestDevice(false, [{ namePrefix: 'DfuTarg' }, { namePrefix: 'Boks-' }]);
    addLog(`Connected to DFU Target: ${dfuDevice.name}`, 'success');

    addLog('Starting update transfer...', 'info');
    await dfu.update(dfuDevice, initData, firmwareData);

    progress.value = 100;
    addLog('DFU Update Complete! The device will now restart.', 'success');
  } catch (err: any) {
    addLog(`DFU Error: ${err.message}`, 'error');
  } finally {
    isFlashing.value = false;
    isConnected.value = false;
    bluetoothDevice.value = null;
  }
}
</script>

<style scoped>
.boks-demo-container {
  margin: 1rem 0;
}
.demo-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  background-color: var(--vp-c-bg-soft);
}
.control-group {
  margin-bottom: 1rem;
}
.device-info {
  background: var(--vp-c-bg-alt);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.device-info ul {
  margin: 0;
  padding-left: 1.5rem;
}
.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.btn-primary {
  background-color: var(--vp-c-brand);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-warning {
  background-color: #eab308;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.btn-warning:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.progress-container {
  margin-top: 1rem;
}
progress {
  width: 100%;
  height: 20px;
}
.logger-box {
  margin-top: 1.5rem;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.85rem;
  max-height: 250px;
  overflow-y: auto;
}
.log-entry {
  margin-bottom: 0.25rem;
}
.time {
  color: #888;
  margin-right: 0.5rem;
}
.msg.info { color: #d4d4d4; }
.msg.success { color: #4ade80; }
.msg.error { color: #f87171; }
.msg.warning { color: #fbbf24; }
</style>
