<script setup>
import { ref } from 'vue'
import { BoksController } from '../../../src/client/BoksController'

// State
const isClient = typeof window !== 'undefined'
const isConnected = ref(false)
const deviceName = ref('')
const batteryLevel = ref(null)
const batteryStats = ref(null)
const hardwareInfo = ref(null)
const logs = ref([])
const isLoading = ref(false)

let controller = null

// Methods
function log(msg, type = 'info') {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    msg,
    type
  })
}

async function connect() {
  if (!isClient) return
  isLoading.value = true

  try {
    log('Requesting Bluetooth device...')
    controller = new BoksController()

    log('Connecting...')
    await controller.connect()

    isConnected.value = true
    hardwareInfo.value = controller.hardwareInfo
    deviceName.value = `Boks Device`

    log('Connected successfully!', 'success')
    await refreshBattery()

  } catch (err) {
    log(`Connection failed: ${err.message}`, 'error')
    console.error(err)
    isConnected.value = false
  } finally {
    isLoading.value = false
  }
}

async function refreshBattery() {
  if (!controller || !isConnected.value) return
  isLoading.value = true

  try {
    log('Reading standard battery level...')
    const level = await controller.getBatteryLevel()
    batteryLevel.value = level
    log(`Standard Battery Level: ${level !== undefined ? level + '%' : 'Unknown'}`)

    log('Reading detailed battery stats...')
    const stats = await controller.getBatteryStats()
    batteryStats.value = stats
    if (stats) {
      log('Battery stats updated.', 'success')
    } else {
      log('Detailed stats unavailable.', 'warning')
    }
  } catch (err) {
    log(`Failed to refresh battery: ${err.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

function getBatteryColor(level) {
  if (level === null || level === undefined) return 'var(--vp-c-gray-1)'
  if (level > 60) return 'var(--vp-c-green-1)'
  if (level > 20) return 'var(--vp-c-yellow-1)'
  return 'var(--vp-c-red-1)'
}
</script>

<template>
  <div class="boks-demo">
    <!-- Connection -->
    <div class="card">
      <h3>1. Connection</h3>
      <div class="row">
        <button @click="connect" :disabled="isConnected || isLoading" class="primary-btn">
          {{ isConnected ? 'Connected' : 'Scan & Connect' }}
        </button>
        <span v-if="isConnected" class="status success">Connected</span>
        <span v-else class="status">Not connected</span>
      </div>
    </div>

    <!-- Hardware Info -->
    <div v-if="isConnected && hardwareInfo" class="card">
      <h3>2. Hardware Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Hardware Version</span>
          <span class="value">{{ hardwareInfo.hardwareVersion }}</span>
        </div>
        <div class="info-item">
          <span class="label">Firmware Revision</span>
          <span class="value">{{ hardwareInfo.firmwareRevision }}</span>
        </div>
        <div class="info-item">
          <span class="label">Software Revision</span>
          <span class="value">{{ hardwareInfo.softwareRevision }}</span>
        </div>
        <div class="info-item">
          <span class="label">Chipset</span>
          <span class="value">{{ hardwareInfo.chipset }}</span>
        </div>
      </div>
    </div>

    <!-- Battery Section -->
    <div v-if="isConnected" class="card">
      <div class="header-row">
        <h3>3. Battery Status</h3>
        <button @click="refreshBattery" :disabled="isLoading" class="secondary-btn small">
          Refresh
        </button>
      </div>

      <!-- Gauge -->
      <div class="gauge-container">
        <div class="gauge-fill" :style="{ width: (batteryLevel || 0) + '%', backgroundColor: getBatteryColor(batteryLevel) }"></div>
        <span class="gauge-text">{{ batteryLevel !== undefined ? batteryLevel + '%' : 'Unknown' }}</span>
      </div>

      <!-- Stats Table -->
      <div v-if="batteryStats" class="stats-table">
        <h4>Detailed Statistics</h4>
        <table>
          <tbody>
            <tr>
              <td>Format</td>
              <td><code>{{ batteryStats.format }}</code></td>
            </tr>
            <tr>
              <td>Main Level</td>
              <td>{{ batteryStats.level }}%</td>
            </tr>
            <tr v-if="batteryStats.temperature !== undefined">
              <td>Temperature</td>
              <td>{{ batteryStats.temperature }}°C</td>
            </tr>
          </tbody>
        </table>

        <div v-if="batteryStats.details" class="details-grid">
          <div v-for="(val, key) in batteryStats.details" :key="key" class="detail-item">
            <span class="detail-label">{{ key }}</span>
            <span class="detail-value">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Logs -->
    <div class="logs">
      <h4>Logs</h4>
      <div class="log-container">
        <div v-for="(log, i) in logs" :key="i" :class="['log-entry', log.type]">
          <span class="time">[{{ log.time }}]</span> {{ log.msg }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boks-demo {
  font-family: var(--vp-font-family-base);
  margin: 2rem 0;
}

.card {
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
.status.success { color: var(--vp-c-green-1); }

.primary-btn {
  background-color: var(--vp-c-brand-1);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.primary-btn:hover { background-color: var(--vp-c-brand-2); }
.primary-btn:disabled { background-color: var(--vp-c-gray-1); cursor: not-allowed; }

.secondary-btn {
  background-color: var(--vp-c-gray-soft);
  color: var(--vp-c-text-1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
}
.secondary-btn.small {
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
.info-item {
  display: flex;
  flex-direction: column;
}
.label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
}
.value {
  font-weight: 600;
}

.gauge-container {
  height: 30px;
  background-color: var(--vp-c-bg);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 1.5rem;
}
.gauge-fill {
  height: 100%;
  transition: width 0.5s ease, background-color 0.5s ease;
}
.gauge-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: var(--vp-c-text-1);
  text-shadow: 0 0 2px var(--vp-c-bg);
}

.stats-table {
  margin-top: 1rem;
}
.stats-table table {
  width: 100%;
  margin-bottom: 1rem;
}
.stats-table td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.details-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.detail-item {
  background: var(--vp-c-bg);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.detail-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
}
.detail-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.logs {
  background: var(--vp-c-bg-alt);
  border-radius: 8px;
  padding: 1rem;
}
.log-container {
  height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.85rem;
}
.log-entry { margin-bottom: 0.25rem; }
.log-entry.error { color: var(--vp-c-red-1); }
.log-entry.success { color: var(--vp-c-green-1); }
.log-entry.warning { color: var(--vp-c-yellow-1); }
.time { color: var(--vp-c-text-3); margin-right: 0.5rem; }
</style>
