<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'
import type { BoksBatteryStats } from '@/protocol/constants'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

const genericBattery = ref<number | null>(null)
const detailedStats = ref<BoksBatteryStats | null>(null)
const isReading = ref(false)
const lastUpdate = ref<Date | null>(null)

async function readHealth() {
  if (!boksStore.controller) return
  isReading.value = true
  try {
    const level = await boksStore.controller.getBatteryLevel()
    if (level !== undefined) genericBattery.value = level
    
    const stats = await boksStore.controller.getBatteryStats()
    if (stats) detailedStats.value = stats
    
    lastUpdate.value = new Date()
    boksStore.log('Hardware health data updated.', 'success')
  } catch (err: any) {
    boksStore.log(`Failed to read health data: ${err.message}`, 'error')
  } finally {
    isReading.value = false
  }
}

async function openAndRead() {
  if (!boksStore.controller) return
  isReading.value = true
  try {
    boksStore.log('Opening door to trigger voltage update...', 'warning')
    // We use a dummy PIN or the active one if available
    const pin = boksStore.activeMasterKey ? '000000' : '000000' 
    // Note: in a real scenario the user would use a real pin. 
    // Here we just try to trigger the motor.
    await boksStore.controller.openDoor(pin).catch(() => {}) 
    
    // Wait a bit for the hardware to update the characteristic
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await readHealth()
  } finally {
    isReading.value = false
  }
}

const batteryMeasures = computed(() => {
  if (!detailedStats.value?.details) return []
  const d = detailedStats.value.details
  if (detailedStats.value.format === 'measures-first-min-mean-max-last') {
    return [d.first, d.min, d.mean, d.max, d.last].filter(v => v !== undefined) as number[]
  }
  return []
})
</script>

<template>
  <div class="demo-card">
    <div class="card action-card">
      <h3>{{ t.health.title }}</h3>
      <p class="desc">{{ t.health.desc }}</p>

      <div class="controls">
        <button @click="readHealth" :disabled="!boksStore.isConnected || isReading" class="primary-btn">
          {{ isReading ? '...' : t.health.readBtn }}
        </button>
        <button @click="openAndRead" :disabled="!boksStore.isConnected || isReading" class="secondary-btn">
          {{ t.health.openDoorBtn }}
        </button>
      </div>

      <div v-if="lastUpdate" class="timestamp">
        {{ t.health.lastUpdate.replace('{time}', lastUpdate.toLocaleTimeString()) }}
      </div>

      <div class="health-grid" v-if="genericBattery !== null || detailedStats">
        <!-- Generic Level -->
        <div class="stat-box" v-if="genericBattery !== null">
          <label>{{ t.health.genericBattery }}</label>
          <div class="value-large">{{ genericBattery }}%</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: genericBattery + '%', backgroundColor: genericBattery < 20 ? 'var(--vp-c-danger-1)' : 'var(--vp-c-brand-1)' }"></div>
          </div>
        </div>

        <!-- Temperature -->
        <div class="stat-box" v-if="detailedStats?.temperature !== undefined">
          <label>{{ t.health.temperature }}</label>
          <div class="value-large">{{ detailedStats.temperature }}°C</div>
        </div>

        <!-- Detailed Voltages -->
        <div class="stat-box full-width" v-if="batteryMeasures.length > 0">
          <label>{{ t.health.detailedBattery }}</label>
          <div class="voltage-list">
            <div v-for="(volt, idx) in batteryMeasures" :key="idx" class="volt-item">
              <span class="volt-label">{{ t.health.batteryLabel.replace('{n}', (idx + 1).toString()) }}</span>
              <span class="volt-value">{{ (volt / 10).toFixed(1) }}{{ t.health.voltUnit }}</span>
            </div>
          </div>
          <p class="note">⚠️ {{ t.health.openDoorWarning }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-card { margin: 1rem 0; }
.card { border: 1px solid var(--vp-c-divider); background-color: var(--vp-c-bg-soft); border-radius: 8px; padding: 1.5rem; }
.desc { font-size: 0.85rem; color: var(--vp-c-text-3); margin-bottom: 1.5rem; }
.controls { display: flex; gap: 1rem; margin-bottom: 1rem; }
.timestamp { font-size: 0.75rem; color: var(--vp-c-text-3); margin-bottom: 1.5rem; text-align: right; }

.primary-btn, .secondary-btn { 
  flex: 1; padding: 0.75rem; border-radius: 6px; font-weight: bold; cursor: pointer; border: none; 
}
.primary-btn { background: var(--vp-c-brand-1); color: white; }
.secondary-btn { background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); border: 1px solid var(--vp-c-divider); }
.primary-btn:disabled, .secondary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.health-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; }
.stat-box { border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); padding: 1rem; border-radius: 6px; }
.full-width { grid-column: span 2; }
@media (max-width: 640px) { .health-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }

.stat-box label { font-size: 0.7rem; text-transform: uppercase; font-weight: bold; color: var(--vp-c-text-2); display: block; margin-bottom: 0.5rem; }
.value-large { font-size: 1.8rem; font-weight: bold; color: var(--vp-c-text-1); }

.progress-bar { height: 8px; background: var(--vp-c-bg-mute); border-radius: 4px; margin-top: 0.5rem; overflow: hidden; }
.progress-fill { height: 100%; transition: width 0.3s ease; }

.voltage-list { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; justify-content: space-between; }
.volt-item { display: flex; flex-direction: column; align-items: center; min-width: 60px; }
.volt-label { font-size: 0.65rem; color: var(--vp-c-text-3); }
.volt-value { font-size: 1.1rem; font-weight: bold; font-family: monospace; }

.note { font-size: 0.75rem; color: var(--vp-c-text-3); margin-top: 1.5rem; font-style: italic; border-top: 1px solid var(--vp-c-divider); padding-top: 0.5rem; }
</style>
