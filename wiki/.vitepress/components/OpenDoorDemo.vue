<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BoksController } from '../../../src/client/BoksController'
import { BoksClient } from '../../../src/client/BoksClient'
import { BoksHardwareSimulator } from '../../../src/simulator/BoksSimulator'
import { SimulatorTransport } from '../../../src/simulator/SimulatorTransport'
import { BoksCodeType } from '../../../src/protocol/constants'

// State
const isClient = typeof window !== 'undefined'
const isConnected = ref(false)
const useSimulator = ref(true) // Default to simulator for easy demo
const deviceName = ref('')
const logs = ref<{ time: string, msg: string, type: string }[]>([])
const pinCode = ref('123456')
const isOpening = ref(false)
const doorStatus = ref<boolean | null>(null)

let controller: BoksController | null = null
let simulator: BoksHardwareSimulator | null = null

function log(msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    msg,
    type
  })
  // Auto-scroll
  setTimeout(() => {
    const el = document.querySelector('.log-container')
    if (el) el.scrollTop = el.scrollHeight
  }, 10)
}

async function connect() {
  if (!isClient) return

  try {
    if (useSimulator.value) {
      log('Initializing Simulator...', 'info')
      simulator = new BoksHardwareSimulator()
      // Pre-provision a known PIN
      simulator.addPinCode('123456', BoksCodeType.Multi)
      log('Simulator initialized. Added code "123456" (Multi-use).', 'success')

      const transport = new SimulatorTransport(simulator)
      const client = new BoksClient(transport)
      controller = new BoksController(client)

      // Connect (SimulatorTransport.connect is no-op but good practice)
      await controller.connect()
      deviceName.value = 'Boks Simulator'

    } else {
      log('Requesting Bluetooth device...', 'info')
      // Default uses WebBluetooth
      controller = new BoksController()
      await controller.connect()
      deviceName.value = controller.hardwareInfo?.hardwareVersion
        ? `Boks (${controller.hardwareInfo.hardwareVersion})`
        : 'Boks Device'
    }

    isConnected.value = true
    log('Connected successfully!', 'success')

    // Initial status check
    await checkStatus()

  } catch (err: any) {
    log(`Connection failed: ${err.message}`, 'error')
    console.error(err)
  }
}

async function disconnect() {
  if (controller) {
    await controller.disconnect()
    controller = null
    simulator = null
    isConnected.value = false
    deviceName.value = ''
    doorStatus.value = null
    log('Disconnected.', 'info')
  }
}

async function openDoor() {
  if (!controller || !isConnected.value) return
  if (!pinCode.value || pinCode.value.length !== 6) {
    log('PIN must be exactly 6 characters.', 'warning')
    return
  }

  isOpening.value = true
  log(`Attempting to open door with PIN "${pinCode.value}"...`, 'info')

  try {
    const success = await controller.openDoor(pinCode.value)
    if (success) {
      log('Door opened successfully!', 'success')
      // Refresh status
      await checkStatus()
      // Auto-refresh status after a few seconds (simulator auto-closes)
      setTimeout(checkStatus, 2000)
      setTimeout(checkStatus, 5000)
      setTimeout(checkStatus, 11000)
    } else {
      log('Failed to open door. Invalid PIN?', 'error')
    }
  } catch (err: any) {
    log(`Error opening door: ${err.message}`, 'error')
  } finally {
    isOpening.value = false
  }
}

async function checkStatus() {
  if (!controller || !isConnected.value) return
  try {
    const isOpen = await controller.getDoorStatus()
    doorStatus.value = isOpen
    log(`Door is ${isOpen ? 'OPEN' : 'CLOSED'}`, isOpen ? 'warning' : 'info')
  } catch (err: any) {
    log(`Failed to get status: ${err.message}`, 'error')
  }
}

</script>

<template>
  <div class="boks-demo">
    <!-- Connection -->
    <div class="card">
      <h3>1. Connection</h3>
      <div class="row" style="margin-bottom: 1rem;">
        <label class="checkbox-label">
          <input type="checkbox" v-model="useSimulator" :disabled="isConnected">
          Use Simulator (No hardware required)
        </label>
      </div>

      <div class="row">
        <button v-if="!isConnected" @click="connect" class="primary-btn">
          {{ useSimulator ? 'Start Simulator' : 'Scan & Connect' }}
        </button>
        <button v-else @click="disconnect" class="secondary-btn">
          Disconnect
        </button>

        <span v-if="isConnected" class="status success">Connected to {{ deviceName }}</span>
        <span v-else class="status">Not connected</span>
      </div>
    </div>

    <!-- Operations -->
    <div class="card">
      <h3>2. Open Door</h3>
      <div class="control-row">
        <div class="input-group">
          <label>PIN Code</label>
          <input
            v-model="pinCode"
            type="text"
            maxlength="6"
            placeholder="123456"
            :disabled="!isConnected || isOpening"
          >
        </div>

        <button
          @click="openDoor"
          :disabled="!isConnected || isOpening || pinCode.length !== 6"
          class="primary-btn big-btn"
        >
          {{ isOpening ? 'Opening...' : 'Open Door' }}
        </button>
      </div>

      <div class="status-display" v-if="isConnected && doorStatus !== null">
        Current State:
        <span :class="['badge', doorStatus ? 'open' : 'closed']">
          {{ doorStatus ? 'OPEN' : 'CLOSED' }}
        </span>
        <button @click="checkStatus" class="icon-btn" title="Refresh Status">🔄</button>
      </div>

      <p v-if="useSimulator && isConnected" class="hint">
        Hint: The simulator is pre-configured with PIN <code>123456</code>.
      </p>
    </div>

    <!-- Logs -->
    <div class="logs">
      <div class="log-header">
        <h4>Logs</h4>
        <button @click="logs = []" class="text-btn">Clear</button>
      </div>
      <div class="log-container">
        <div v-for="(l, i) in logs" :key="i" :class="['log-entry', l.type]">
          <span class="time">[{{ l.time }}]</span> {{ l.msg }}
        </div>
        <div v-if="logs.length === 0" class="empty-logs">No logs yet.</div>
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
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.status {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
.status.success { color: var(--vp-c-green-1); }

.control-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.input-group input {
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: monospace;
  font-size: 1.1rem;
  width: 120px;
  text-align: center;
  letter-spacing: 2px;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-weight: 500;
}

.badge {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge.open { background-color: var(--vp-c-yellow-soft); color: var(--vp-c-yellow-1); }
.badge.closed { background-color: var(--vp-c-green-soft); color: var(--vp-c-green-1); }

.hint {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.primary-btn {
  background-color: var(--vp-c-brand-1);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}
.primary-btn:hover { background-color: var(--vp-c-brand-2); }
.primary-btn:disabled { background-color: var(--vp-c-gray-1); cursor: not-allowed; opacity: 0.7; }

.secondary-btn {
  background-color: var(--vp-c-gray-soft);
  color: var(--vp-c-text-1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
}
.secondary-btn:hover { background-color: var(--vp-c-gray-1); }

.big-btn {
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.2rem;
}

.text-btn {
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.logs {
  background: var(--vp-c-bg-alt);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.log-header h4 { margin: 0; }

.log-container {
  height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.85rem;
  background: var(--vp-c-bg);
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.log-entry { margin-bottom: 0.25rem; line-height: 1.4; }
.log-entry.error { color: var(--vp-c-red-1); }
.log-entry.success { color: var(--vp-c-green-1); }
.log-entry.warning { color: var(--vp-c-yellow-1); }
.time { color: var(--vp-c-text-3); margin-right: 0.5rem; user-select: none; }
.empty-logs { color: var(--vp-c-text-3); font-style: italic; text-align: center; margin-top: 1rem; }
</style>
