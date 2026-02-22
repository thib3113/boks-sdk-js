<script setup lang="ts">
import { ref } from 'vue'
import { boksStore } from '../boksStore'

// Local State
const batteryLevel = ref<number | undefined>(undefined)
const batteryStats = ref<any>(null)
const hardwareInfo = ref<any>(null)
const isLoading = ref(false)

async function refreshData() {
  if (!boksStore.controller || !boksStore.isConnected) {
    alert('Please connect first using the Global Controller.')
    return
  }
  isLoading.value = true

  try {
    hardwareInfo.value = boksStore.controller.hardwareInfo
    
    boksStore.log('Reading battery levels...', 'info')
    batteryLevel.value = await boksStore.controller.getBatteryLevel()
    batteryStats.value = await boksStore.controller.getBatteryStats()
    
    boksStore.log('Battery and Hardware data refreshed.', 'success')
  } catch (err: any) {
    boksStore.log(`Failed to refresh data: ${err.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

function getBatteryColor(level: number | undefined) {
  if (level === undefined) return 'var(--vp-c-gray-1)'
  if (level > 60) return 'var(--vp-c-green-1)'
  if (level > 20) return 'var(--vp-c-yellow-1)'
  return 'var(--vp-c-red-1)'
}
</script>

<template>
  <div class="demo-card">
    <div v-if="!boksStore.isConnected" class="warning-box">
      ⚠️ <strong>Not Connected</strong>. Please use the connection panel at the top of the page.
    </div>

    <div class="card">
      <div class="header-row">
        <h3>Battery & Hardware Info</h3>
        <button @click="refreshData" :disabled="!boksStore.isConnected || isLoading" class="secondary-btn small">
          {{ isLoading ? 'Refreshing...' : 'Refresh Data' }}
        </button>
      </div>

      <div v-if="boksStore.isConnected && hardwareInfo" class="info-grid">
        <div class="info-item">
          <span class="label">HW Version</span>
          <span class="value">{{ hardwareInfo.hardwareVersion }}</span>
        </div>
        <div class="info-item">
          <span class="label">FW Revision</span>
          <span class="value">{{ hardwareInfo.firmwareRevision }}</span>
        </div>
        <div class="info-item">
          <span class="label">Chipset</span>
          <span class="value">{{ hardwareInfo.chipset }}</span>
        </div>
      </div>

      <div v-if="boksStore.isConnected" class="battery-section">
        <div class="gauge-container">
          <div class="gauge-fill" :style="{ width: (batteryLevel || 0) + '%', backgroundColor: getBatteryColor(batteryLevel) }"></div>
          <span class="gauge-text">{{ batteryLevel !== undefined ? batteryLevel + '%' : '??%' }}</span>
        </div>

        <div v-if="batteryStats" class="stats-table">
          <table>
            <tbody>
              <tr><td>Format</td><td><code>{{ batteryStats.format }}</code></td></tr>
              <tr v-if="batteryStats.temperature !== undefined"><td>Temp</td><td>{{ batteryStats.temperature }}°C</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-card { margin: 1rem 0; }
.card { border: 1px solid var(--vp-c-divider); background-color: var(--vp-c-bg-soft); border-radius: 8px; padding: 1.5rem; }
.warning-box { background-color: rgba(239, 68, 68, 0.1); color: var(--vp-c-red-1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--vp-c-red-1); }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.header-row h3 { margin: 0; }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.info-item { display: flex; flex-direction: column; }
.label { font-size: 0.75rem; color: var(--vp-c-text-2); text-transform: uppercase; }
.value { font-weight: 600; font-size: 0.95rem; }
.battery-section { margin-top: 1rem; }
.gauge-container { height: 24px; background-color: var(--vp-c-bg); border-radius: 12px; overflow: hidden; position: relative; border: 1px solid var(--vp-c-divider); }
.gauge-fill { height: 100%; transition: width 0.5s ease; }
.gauge-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 0.8rem; }
.stats-table { margin-top: 1rem; font-size: 0.85rem; }
.stats-table table { width: 100%; }
.stats-table td { padding: 0.4rem; border-bottom: 1px solid var(--vp-c-divider); }
.secondary-btn { background-color: var(--vp-c-gray-soft); color: var(--vp-c-text-1); padding: 0.4rem 0.8rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); cursor: pointer; font-size: 0.85rem; }
</style>
