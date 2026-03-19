<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { boksStore } from '../boksStore'
import { BoksOpcode } from '../../../src/protocol/constants'
import { useData } from 'vitepress'
import { i18n } from '../i18n'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

// Simulator local state for UI binding
const simState = ref<any>({ batteryLevel: 100 })
const showSimControls = ref(true)
const showClearConfirm = ref(false)

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

function triggerRealisticOpen(type: 'keypad' | 'key' | 'nfc') {
  if (!boksStore.simulator) return;

  const detail = type === 'keypad' ? '123456' : type === 'nfc' ? 'AABBCCDD' : '';
  
  switch (type) {
    case 'keypad':
      boksStore.simulator.triggerKeypadOpen(detail);
      break;
    case 'key':
      boksStore.simulator.triggerPhysicalKeyOpen();
      break;
    case 'nfc':
      boksStore.simulator.triggerNfcOpen(detail);
      break;
  }
  
  boksStore.log(t.value.logger.simTriggered.replace('{type}', type), 'success');
}

function exportLogs() {
  // Convert packet logs to a JSON array string
  // Map over the logs to structure the output well
  const exportedLogs = boksStore.packetLogs.map(log => {
    // Clone the raw data and remove opcode to avoid redundancy in the export
    const packetData = JSON.parse(JSON.stringify(log.rawData));
    if (packetData && typeof packetData === 'object') {
      delete packetData.opcode;
    }
    
    return {
      time: log.time,
      direction: log.direction,
      opcode: log.opcode,
      name: log.name,
      length: log.length,
      data: packetData
    };
  });
  const dataStr = JSON.stringify(exportedLogs, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `boks-packet-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

</script>

<template>
  <div :class="['sdk-dashboard', { expanded: boksStore.isExpanded }]">
    <!-- BAND (Header) -->
    <div class="dashboard-header" @click="boksStore.isExpanded = !boksStore.isExpanded">
      <div class="title">
        📡 {{ t.logger.title }}
        <span class="target-name" v-if="boksStore.isConnected"> — {{ boksStore.deviceName }}</span>
      </div>

      <div class="header-actions">
        <label class="sim-switch" @click.stop v-if="!boksStore.isConnected" :title="t.logger.simulator">
          <div class="switch-control">
            <input type="checkbox" v-model="boksStore.useSimulator" id="simToggle">
            <div class="slider round"></div>
          </div>
          <span>{{ t.logger.simulator }}</span>
        </label>

        <button @click.stop="toggleConnection" :class="['action-btn-main', { connected: boksStore.isConnected, loading: boksStore.isConnecting }]">
          <span v-if="boksStore.isConnecting" class="spinner">⏳</span>
          <span :class="{ 'desktop-only': boksStore.isConnecting }">{{ boksStore.isConnecting ? t.logger.working : (boksStore.isConnected ? t.logger.disconnect : (boksStore.useSimulator ? t.logger.start : t.logger.connect)) }}</span>
        </button>
        
        <span class="arrow">{{ boksStore.isExpanded ? '▼' : '▲' }}</span>
      </div>
    </div>

    <!-- EXPANDED CONTENT -->
    <div v-if="boksStore.isExpanded" class="dashboard-content">
      
      <!-- DEVICE STATUS & CONTROL -->
      <div class="config-section">
        <div class="section-header" @click="showSimControls = !showSimControls">
          <h4>{{ t.logger.deviceStatus }}</h4>
          <span class="mobile-only">{{ showSimControls ? '▼' : '▲' }}</span>
        </div>
        
        <div class="config-body" v-if="showSimControls">
          <div class="config-grid">
            <!-- Info for both Real and Sim -->
            <div class="config-item">
              <label>{{ t.logger.batteryLevel }} <strong>{{ (boksStore.useSimulator ? simState.batteryLevel : boksStore.batteryLevel) ?? 100 }}%</strong></label>
              <input v-if="boksStore.useSimulator" type="range" min="0" max="100" v-model.number="simState.batteryLevel" @input="boksStore.simulator?.setBatteryLevel(simState.batteryLevel)">
              <div v-else class="gauge-mini"><div class="gauge-fill" :style="{ width: boksStore.batteryLevel + '%' }"></div></div>
            </div>

            <!-- Simulator-only Actions -->
            <template v-if="boksStore.useSimulator">
              <div class="config-item row">
                <button @click="boksStore.simulator?.setDoorStatus(!simState.isOpen)" :class="['ctrl-btn', { active: simState.isOpen }]">
                  {{ simState.isOpen ? t.logger.closeDoor : t.logger.openDoor }}
                </button>
                <button @click="boksStore.simulator?.setChaosMode(!simState.chaosMode)" :class="['ctrl-btn', { warning: simState.chaosMode }]">
                  {{ simState.chaosMode ? t.logger.chaosMode : t.logger.normalMode }}
                </button>
              </div>

              <div class="sub-title">{{ t.logger.triggerEvents }}</div>
              <div class="config-item row tri">
                <button @click="triggerRealisticOpen('keypad')" class="small-btn">{{ t.logger.keypad }}</button>
                <button @click="triggerRealisticOpen('key')" class="small-btn">{{ t.logger.key }}</button>
                <button @click="triggerRealisticOpen('nfc')" class="small-btn">{{ t.logger.nfc }}</button>
              </div>
            </template>

            <!-- Metadata for both -->
            <div class="debug-info">
              <div class="debug-row">
                <span class="label">{{ t.logger.software }}</span>
                <span class="value">{{ boksStore.useSimulator ? simState.softwareVersion : boksStore.softwareVersion }}</span>
              </div>
              <div class="debug-row">
                <span class="label">{{ t.logger.firmware }}</span>
                <span class="value">{{ boksStore.useSimulator ? simState.firmwareVersion : boksStore.firmwareVersion }}</span>
              </div>
              <div class="debug-row">
                <span class="label">{{ t.logger.masterCodes }}</span>
                <span class="value">{{ boksStore.useSimulator ? simState.pinsCount : boksStore.masterCodesCount }}</span>
              </div>
              <div class="debug-row">
                <span class="label">{{ t.logger.singleUse }}</span>
                <span class="value">{{ boksStore.useSimulator ? 'N/A' : boksStore.singleCodesCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PACKET LOGS -->
      <div class="log-section">
        <div class="section-header">
          <h4>{{ t.logger.packetFlow }}</h4>

          <div class="section-header-actions">
            <button @click="exportLogs" class="action-btn" :title="t.logger.exportJson">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
            <button @click="showClearConfirm = true" class="clear-btn">{{ t.logger.clear }}</button>
          </div>

        </div>
        <div class="scroll-container">
          <table v-if="boksStore.packetLogs.length" class="log-table">
            <thead>
              <tr>
                <th class="time-col">{{ t.logger.time }}</th>
                <th class="dir-col">{{ t.logger.dir }}</th>
                <th class="op-col">{{ t.logger.op }}</th>
                <th class="name-col">{{ t.logger.desc }}</th>
                <th>{{ t.logger.data }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, i) in boksStore.packetLogs" :key="i" :class="log.direction">
                <td class="time">{{ log.time }}</td>
                <td class="dir"><strong>{{ log.direction }}</strong></td>
                <td class="op"><code>{{ log.opcode }}</code></td>
                <td class="name">{{ log.name }}</td>
                <td class="data">
                  <pre v-if="log.rawData" class="json-data"><code>{{ JSON.stringify(log.rawData, (key, val) => key === 'opcode' ? undefined : val, 2) }}</code></pre>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-state">
            <div class="pulse-icon">📡</div>
            <p>{{ t.logger.waiting }}</p>
            <span>{{ t.logger.interact }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- CLEAR CONFIRMATION MODAL -->
    <div v-if="showClearConfirm" class="modal-overlay">
      <div class="modal-content">
        <h4>{{ t.logger.clearLogsTitle }}</h4>
        <p>{{ t.logger.clearLogsDesc }}</p>
        <div class="modal-actions">
          <button @click="showClearConfirm = false" class="modal-btn cancel">{{ t.logger.cancel }}</button>
          <button @click="boksStore.packetLogs = []; showClearConfirm = false" class="modal-btn confirm">{{ t.logger.confirm }}</button>
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
.sim-switch { font-size: 0.75rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: var(--vp-c-text-2); background: var(--vp-c-bg); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); }
.switch-control { position: relative; display: inline-block; width: 28px; height: 16px; margin-right: 2px; }
.switch-control input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--vp-c-gray-1); transition: .2s; border-radius: 16px; }
.slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 2px; bottom: 2px; background-color: white; transition: .2s; border-radius: 50%; }
input:checked + .slider { background-color: var(--vp-c-brand-1); }
input:checked + .slider:before { transform: translateX(12px); }
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

.section-header { display: flex; justify-content: space-between; align-items: center; }
.section-header-actions { display: flex; gap: 0.5rem; align-items: center; }
.action-btn { background: none; border: none; color: var(--vp-c-text-2); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0.2rem; border-radius: 4px; transition: color 0.2s, background 0.2s; }
.action-btn:hover { color: var(--vp-c-brand-1); background: var(--vp-c-bg-soft); }

.modal-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); z-index: 200;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider);
  border-radius: 8px; padding: 1.5rem; width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.modal-content h4 { margin: 0 0 0.5rem 0; color: var(--vp-c-text-1); }
.modal-content p { margin: 0 0 1.5rem 0; font-size: 0.85rem; color: var(--vp-c-text-2); }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.modal-btn { padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: 600; }
.modal-btn.cancel { background: var(--vp-c-bg-alt); border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2); }
.modal-btn.confirm { background: var(--vp-c-red-1); border: none; color: white; }

.json-data { margin: 0; padding: 0.4rem; background: var(--vp-c-bg-alt); border-radius: 4px; font-size: 0.7rem; max-height: 150px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; }

</style>
