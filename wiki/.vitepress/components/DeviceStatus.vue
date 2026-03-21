<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

// Simulator local state for UI binding
const simState = ref<any>({ batteryLevel: 100 })
const showSimControls = ref(true)
const showEditSim = ref(false)
const editSimForm = ref({
  software: '',
  firmware: '',
  masterKey: ''
})

let interval: any;

function refreshSimState() {
  if (boksStore.simulator) {
    simState.value = boksStore.simulator.getPublicState()
  }
}

onMounted(() => {
  interval = setInterval(refreshSimState, 1000)
})

onUnmounted(() => {
  clearInterval(interval);
})

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


function openEditSim() {
  if (boksStore.simulator) {
    const sim = boksStore.simulator;
    const state = sim.getInternalState();
    editSimForm.value = {
      software: sim.getPublicState().softwareVersion || '',
      firmware: sim.getPublicState().firmwareVersion || '',
      masterKey: Array.from(state.masterKey).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    };
  }
  showEditSim.value = true;
}

function generateRandomKey() {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  editSimForm.value.masterKey = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function saveSimEdit() {
  if (boksStore.simulator) {
    const sim = boksStore.simulator;
    sim.setSoftwareVersion(editSimForm.value.software || '0.0.0');
    sim.setFirmwareVersion(editSimForm.value.firmware || '0.0.0');
    if (editSimForm.value.masterKey) sim.setMasterKey(editSimForm.value.masterKey);
    simState.value = sim.getPublicState();
  }
  showEditSim.value = false;
}
</script>

<template>
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
            <button @click="boksStore.simulator?.setDoorStatus(!simState.isOpen)" :class="['ctrl-btn', { active: simState.isOpen }]" data-testid="sim-toggle-door-button">
              {{ simState.isOpen ? t.logger.closeDoor : t.logger.openDoor }}
            </button>
            <button @click="boksStore.simulator?.setChaosMode(!simState.chaosMode)" :class="['ctrl-btn', { warning: simState.chaosMode }]" data-testid="sim-toggle-chaos-button">
              {{ simState.chaosMode ? t.logger.chaosMode : t.logger.normalMode }}
            </button>
          </div>

          <div class="sub-title">{{ t.logger.triggerEvents }}</div>
          <div class="config-item row tri">
            <button @click="triggerRealisticOpen('keypad')" class="small-btn" data-testid="sim-trigger-keypad">{{ t.logger.keypad }}</button>
            <button @click="triggerRealisticOpen('key')" class="small-btn" data-testid="sim-trigger-key">{{ t.logger.key }}</button>
            <button @click="triggerRealisticOpen('nfc')" class="small-btn" data-testid="sim-trigger-nfc">{{ t.logger.nfc }}</button>
          </div>
        </template>

        <!-- Metadata for both -->
        <div class="debug-info">
          <span v-if="boksStore.useSimulator" class="edit-icon" @click="openEditSim()" title="Edit simulator config">✏️</span>
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

    <!-- SIMULATOR EDIT MODAL -->
    <div v-if="showEditSim" class="modal-overlay">
      <div class="modal-content">
        <h4>Edit Simulator</h4>
        <div class="field" style="margin-bottom: 0.5rem">
          <label>Software Version</label>
          <input type="text" v-model="editSimForm.software" class="sim-edit-input" data-testid="sim-edit-software" />
        </div>
        <div class="field" style="margin-bottom: 0.5rem">
          <label>Firmware Version</label>
          <input type="text" v-model="editSimForm.firmware" class="sim-edit-input" data-testid="sim-edit-firmware" />
        </div>
        <div class="field" style="margin-bottom: 1rem">
          <label>Master Key (hex)</label>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <input type="text" v-model="editSimForm.masterKey" class="sim-edit-input" placeholder="e.g. 01020304..." data-testid="sim-edit-masterkey" />
            <button @click="generateRandomKey" style="background: var(--vp-c-bg-alt); border: 1px solid var(--vp-c-divider); border-radius: 4px; cursor: pointer; padding: 0.4rem; font-size: 1rem;" title="Generate random key">🎲</button>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showEditSim = false" class="modal-btn cancel">{{ t.logger.cancel }}</button>
          <button @click="saveSimEdit" class="modal-btn confirm" data-testid="sim-edit-save">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-header { padding: 0.4rem 1rem; background: var(--vp-c-bg); border-bottom: 1px solid var(--vp-c-divider); display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.section-header h4 { margin: 0; font-size: 0.7rem; text-transform: uppercase; color: var(--vp-c-text-3); letter-spacing: 0.5px; }

.config-section { border-right: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft); overflow-y: auto; height: 100%; }
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

.debug-info { position: relative; margin-top: 1rem; font-size: 0.65rem; color: var(--vp-c-text-3); line-height: 1.4; border-top: 1px solid var(--vp-c-divider); padding-top: 0.5rem; }
.debug-row { display: flex; justify-content: space-between; gap: 1rem; }
.edit-icon { position: absolute; right: 0; top: -15px; cursor: pointer; font-size: 1rem; padding: 2px; }

.mobile-only { display: none; }
@media (max-width: 768px) {
  .mobile-only { display: inline; }
  .config-section { border-right: none; border-bottom: 1px solid var(--vp-c-divider); }
}

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); z-index: 300;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider);
  border-radius: 8px; padding: 1.5rem; width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.modal-content h4 { margin: 0 0 0.5rem 0; color: var(--vp-c-text-1); }
.field { margin-bottom: 0.5rem; }
.field label { display: block; font-size: 0.8rem; margin-bottom: 0.25rem; color: var(--vp-c-text-2); }
.sim-edit-input { width: 100%; padding: 0.4rem; font-size: 0.9rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
.modal-btn { padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: 600; }
.modal-btn.cancel { background: var(--vp-c-bg-alt); border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2); }
.modal-btn.confirm { background: var(--vp-c-brand-1); border: none; color: white; }
</style>
