<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { boksStore } from '../boksStore'
import { BoksOpcode, BoksOpenSource } from '../../../src/protocol/constants'

// Simulator local state for UI binding
const simState = ref<any>({})
const showSimControls = ref(true)

function refreshSimState() {
  if (boksStore.simulator) {
    simState.value = boksStore.simulator.getPublicState()
  }
}

onMounted(() => {
  setInterval(refreshSimState, 1000)
})

async function toggleConnection() {
  if (boksStore.isConnected) {
    await boksStore.disconnect()
  } else {
    try {
      await boksStore.connect()
    } catch (e) {}
  }
}

function triggerRealisticOpen(source: BoksOpenSource) {
  const detail = source === BoksOpenSource.Keypad ? '123456' : source === BoksOpenSource.Nfc ? 'AABBCCDD' : ''
  boksStore.simulator?.triggerDoorOpen(source, detail)
  boksStore.log(`Simulator: Triggered opening via ${BoksOpenSource[source]}`, 'success')
}
</script>

<template>
  <div :class="['sdk-dashboard', { expanded: boksStore.isExpanded }]">
    <!-- BAND (Header) -->
    <div class="dashboard-header" @click="boksStore.isExpanded = !boksStore.isExpanded">
      <div class="title">
        📡 SDK Dashboard
        <span class="target-name" v-if="boksStore.isConnected"> — {{ boksStore.deviceName }}</span>
      </div>

      <div class="header-actions">
        <label class="sim-switch desktop-only" @click.stop v-if="!boksStore.isConnected">
          <input type="checkbox" v-model="boksStore.useSimulator">
          <span>{{ boksStore.useSimulator ? 'Simulator' : 'Real BLE' }}</span>
        </label>

        <button @click.stop="toggleConnection" :class="['action-btn-main', { connected: boksStore.isConnected, loading: boksStore.isConnecting }]">
          <span v-if="boksStore.isConnecting" class="spinner">⏳</span>
          {{ boksStore.isConnecting ? 'Working...' : (boksStore.isConnected ? 'Disconnect' : (boksStore.useSimulator ? 'Start' : 'Connect')) }}
        </button>
        
        <span class="arrow">{{ boksStore.isExpanded ? '▼' : '▲' }}</span>
      </div>
    </div>

    <!-- EXPANDED CONTENT -->
    <div v-if="boksStore.isExpanded" class="dashboard-content">
      
      <!-- DEVICE STATUS & CONTROL -->
      <div class="config-section">
        <div class="section-header" @click="showSimControls = !showSimControls">
          <h4>Device Status & Info</h4>
          <span class="mobile-only">{{ showSimControls ? '▼' : '▲' }}</span>
        </div>
        
        <div class="config-body" v-if="showSimControls">
          <div class="config-grid">
            <!-- Info for both Real and Sim -->
            <div class="config-item">
              <label>Battery Level: <strong>{{ (boksStore.useSimulator ? simState.batteryLevel : boksStore.batteryLevel) ?? 100 }}%</strong></label>
              <input v-if="boksStore.useSimulator" type="range" min="0" max="100" v-model.number="simState.batteryLevel" @input="boksStore.simulator?.setBatteryLevel(simState.batteryLevel)">
              <div v-else class="gauge-mini"><div class="gauge-fill" :style="{ width: boksStore.batteryLevel + '%' }"></div></div>
            </div>

            <!-- Simulator-only Actions -->
            <template v-if="boksStore.useSimulator">
              <div class="config-item row">
                <button @click="boksStore.simulator?.setDoorStatus(!simState.isOpen)" :class="['ctrl-btn', { active: simState.isOpen }]">
                  {{ simState.isOpen ? '🔒 Close Door' : '🔓 Open Door' }}
                </button>
                <button @click="boksStore.simulator?.setChaosMode(!simState.chaosMode)" :class="['ctrl-btn', { warning: simState.chaosMode }]">
                  {{ simState.chaosMode ? '🔥 Chaos' : '🛡️ Normal' }}
                </button>
              </div>

              <div class="sub-title">Trigger Physical Events</div>
              <div class="config-item row tri">
                <button @click="triggerRealisticOpen(BoksOpenSource.Keypad)" class="small-btn">🔢 Keypad</button>
                <button @click="triggerRealisticOpen(BoksOpenSource.PhysicalKey)" class="small-btn">🔑 Key</button>
                <button @click="triggerRealisticOpen(BoksOpenSource.Nfc)" class="small-btn">💳 NFC</button>
              </div>
            </template>

            <!-- Metadata for both -->
            <div class="debug-info">
              <div class="debug-row">
                <span class="label">Software</span>
                <span class="value">{{ boksStore.useSimulator ? simState.softwareVersion : boksStore.softwareVersion }}</span>
              </div>
              <div class="debug-row">
                <span class="label">Firmware</span>
                <span class="value">{{ boksStore.useSimulator ? simState.firmwareVersion : boksStore.firmwareVersion }}</span>
              </div>
              <div class="debug-row">
                <span class="label">Master Codes</span>
                <span class="value">{{ boksStore.useSimulator ? simState.pinsCount : boksStore.masterCodesCount }}</span>
              </div>
              <div class="debug-row">
                <span class="label">Single-Use</span>
                <span class="value">{{ boksStore.useSimulator ? 'N/A' : boksStore.singleCodesCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PACKET LOGS -->
      <div class="log-section">
        <div class="section-header">
          <h4>Packet Flow</h4>
          <button @click="boksStore.packetLogs = []" class="clear-btn">Clear</button>
        </div>
        <div class="scroll-container">
          <table v-if="boksStore.packetLogs.length" class="log-table">
            <thead>
              <tr>
                <th class="time-col">Time</th>
                <th class="dir-col">D</th>
                <th class="op-col">Op</th>
                <th class="name-col">Description</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, i) in boksStore.packetLogs" :key="i" :class="log.direction">
                <td class="time">{{ log.time }}</td>
                <td class="dir"><strong>{{ log.direction }}</strong></td>
                <td class="op"><code>{{ log.opcode }}</code></td>
                <td class="name">{{ log.name }}</td>
                <td class="data">
                  <code v-if="log.data">{{ JSON.stringify(log.data) }}</code>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-state">
            <div class="pulse-icon">📡</div>
            <p>Waiting for traffic...</p>
            <span>Interact with the SDK to see live packets</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.sdk-dashboard {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--vp-c-bg-soft); border-top: 1px solid var(--vp-c-divider);
  z-index: 100; font-family: var(--vp-font-family-base); transition: all 0.3s ease;
}
.sdk-dashboard.expanded { height: 400px; }

.dashboard-header {
  padding: 0.5rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; background: var(--vp-c-bg-alt); user-select: none; border-bottom: 1px solid var(--vp-c-divider);
}

.title { font-weight: bold; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; color: var(--vp-c-text-1); }
.status-badge { font-size: 0.6rem; padding: 0.1rem 0.3rem; border-radius: 4px; background: var(--vp-c-gray-1); color: white; }
.status-badge.connected { background: var(--vp-c-green-1); }
.target-name { font-size: 0.75rem; color: var(--vp-c-text-2); font-weight: normal; }

.header-actions { display: flex; align-items: center; gap: 1rem; }
.sim-switch { font-size: 0.75rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: var(--vp-c-text-2); }
.action-btn-main { 
  padding: 0.25rem 0.75rem; border-radius: 6px; border: none; 
  background: var(--vp-c-brand-1); color: white; font-size: 0.75rem; font-weight: bold; cursor: pointer;
  display: flex; align-items: center; gap: 0.4rem;
}
.action-btn-main.loading { opacity: 0.8; cursor: wait; }
.spinner { display: inline-block; animation: spin 2s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.action-btn-main.connected { background: var(--vp-c-red-soft); color: var(--vp-c-red-1); border: 1px solid var(--vp-c-red-1); }

.dashboard-content { height: 360px; display: grid; grid-template-columns: 400px 1fr; }

.section-header { padding: 0.4rem 1rem; background: var(--vp-c-bg); border-bottom: 1px solid var(--vp-c-divider); display: flex; justify-content: space-between; align-items: center; }
.section-header h4 { margin: 0; font-size: 0.7rem; text-transform: uppercase; color: var(--vp-c-text-3); letter-spacing: 0.5px; }

/* CONFIG SECTION */
.config-section { border-right: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); overflow-y: auto; }
.config-body { padding: 1rem; }
.config-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.config-item label { font-size: 0.75rem; margin-bottom: 0.2rem; display: block; font-weight: 600; }
.config-item input[type="range"] { width: 100%; margin: 0.25rem 0; }
.config-item.row { display: flex; gap: 0.5rem; }
.sub-title { font-size: 0.65rem; font-weight: bold; text-transform: uppercase; color: var(--vp-c-text-3); margin-top: 0.5rem; }
.ctrl-btn { flex: 1; padding: 0.4rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); font-size: 0.75rem; cursor: pointer; background: var(--vp-c-bg); font-weight: 600; }
.ctrl-btn.active { background: var(--vp-c-yellow-soft); color: var(--vp-c-yellow-1); border-color: var(--vp-c-yellow-1); }
.ctrl-btn.warning { color: var(--vp-c-red-1); border-color: var(--vp-c-red-1); }
.gauge-mini { height: 6px; background: var(--vp-c-bg); border-radius: 3px; overflow: hidden; border: 1px solid var(--vp-c-divider); margin-top: 0.25rem; }
.gauge-fill { height: 100%; background: var(--vp-c-green-1); transition: width 0.5s ease; }
.small-btn { flex: 1; padding: 0.3rem; font-size: 0.7rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); cursor: pointer; }

/* LOG SECTION */
.log-section { display: flex; flex-direction: column; overflow: hidden; background: var(--vp-c-bg); }
.scroll-container { flex: 1; overflow-y: auto; padding: 0; margin: 0; }
.log-table { width: 100%; border-collapse: collapse; font-family: monospace; font-size: 0.75rem; table-layout: auto; margin: 0; }
.log-table th { position: sticky; top: 0; background: var(--vp-c-bg-soft); padding: 0.4rem; text-align: left; border-bottom: 1px solid var(--vp-c-divider); z-index: 1; color: var(--vp-c-text-3); font-size: 0.65rem; }
.log-table td { padding: 0.4rem; border-bottom: 1px solid var(--vp-c-divider); vertical-align: top; }
.log-table td.data { width: 100%; }
.TX { color: var(--vp-c-brand-1); background: rgba(59, 130, 246, 0.02); }
.RX { color: var(--vp-c-green-1); background: rgba(16, 185, 129, 0.02); }

.time-col { width: 85px; }
.dir-col { width: 35px; }
.op-col { width: 50px; }
.name-col { width: 180px; }

.clear-btn { background: none; border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-3); cursor: pointer; font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px; }
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; padding: 2rem; text-align: center; color: var(--vp-c-text-3);
}
.empty-state p { margin: 0.5rem 0 0.25rem 0; font-weight: 600; color: var(--vp-c-text-2); font-size: 0.85rem; }
.empty-state span { font-size: 0.7rem; opacity: 0.7; }
.pulse-icon {
  font-size: 1.5rem; animation: pulse 2s infinite ease-in-out;
}
@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
}
.debug-info { margin-top: 1rem; font-size: 0.65rem; color: var(--vp-c-text-3); line-height: 1.4; border-top: 1px solid var(--vp-c-divider); padding-top: 0.5rem; }
.debug-row { display: flex; justify-content: space-between; gap: 1rem; }

/* RESPONSIVE */
.mobile-only { display: none; }
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: inline; }
  .sdk-dashboard.expanded { height: 80vh; }
  .dashboard-content { grid-template-columns: 1fr; grid-template-rows: auto 1fr; height: calc(80vh - 40px); }
  .config-section { border-right: none; border-bottom: 1px solid var(--vp-c-divider); }
  .log-table th.name-col, .log-table td.name { display: none; } /* Hide description on mobile to save space */
  .log-table th.time-col, .log-table td.time { width: 60px; }
}
</style>
