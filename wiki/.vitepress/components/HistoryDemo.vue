<script setup>
import { ref, computed } from 'vue'
import { BoksController } from '../../../src/client/BoksController'
import { BoksOpcode } from '../../../src/protocol/constants'

// State
const isClient = typeof window !== 'undefined'
const isConnected = ref(false)
const isFetching = ref(false)
const deviceName = ref('')
const historyEvents = ref([])
const logs = ref([])

let controller = null

// Methods
function log(msg, type = 'info') {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    msg,
    type
  })
}

async function connect() {
  if (!isClient) return

  try {
    log('Requesting Bluetooth device...')

    // Create controller (defaults to WebBluetooth)
    controller = new BoksController()

    log('Connecting...')
    await controller.connect()

    isConnected.value = true
    // Get info from controller
    deviceName.value = controller.hardwareInfo?.hardwareVersion ? `Boks (${controller.hardwareInfo.hardwareVersion})` : 'Boks Device'
    log('Connected successfully!', 'success')

  } catch (err) {
    log(`Connection failed: ${err.message}`, 'error')
    console.error(err)
  }
}

async function fetchHistory() {
  if (!controller || !isConnected.value) return

  isFetching.value = true
  historyEvents.value = []
  log('Fetching history...', 'info')

  try {
    const events = await controller.fetchHistory()

    // Sort by date descending (newest first)
    historyEvents.value = events.sort((a, b) => b.date - a.date)

    log(`Fetched ${events.length} history events.`, 'success')
  } catch (err) {
    log(`Failed to fetch history: ${err.message}`, 'error')
    console.error(err)
  } finally {
    isFetching.value = false
  }
}

function getEventDetails(event) {
  const opcode = event.opcode

  switch (opcode) {
    case BoksOpcode.LOG_DOOR_OPEN:
      return { icon: '🚪', text: 'Door Opened', class: 'event-open' }
    case BoksOpcode.LOG_DOOR_CLOSE:
      return { icon: '🔒', text: 'Door Closed', class: 'event-close' }

    case BoksOpcode.LOG_CODE_BLE_VALID:
      return { icon: '📱', text: 'Valid Code (App/BLE)', class: 'event-success' }
    case BoksOpcode.LOG_CODE_KEY_VALID:
      return { icon: '🔢', text: 'Valid Code (Keypad)', class: 'event-success' }
    case BoksOpcode.LOG_EVENT_NFC_OPENING:
      return { icon: '💳', text: 'Valid NFC Tag', class: 'event-success' }
    case BoksOpcode.LOG_EVENT_KEY_OPENING:
      return { icon: '🔑', text: 'Physical Key Used', class: 'event-warning' }

    case BoksOpcode.LOG_CODE_BLE_INVALID:
      return { icon: '❌', text: 'Invalid Code (App/BLE)', class: 'event-error' }
    case BoksOpcode.LOG_CODE_KEY_INVALID:
      return { icon: '❌', text: 'Invalid Code (Keypad)', class: 'event-error' }

    case BoksOpcode.LOG_EVENT_NFC_REGISTERING:
      return { icon: 'cw', text: 'NFC Tag Registered', class: 'event-info' }

    case BoksOpcode.POWER_ON:
      return { icon: '⚡', text: 'Power On', class: 'event-system' }
    case BoksOpcode.POWER_OFF:
      return { icon: '💤', text: 'Power Off', class: 'event-system' }
    case BoksOpcode.BLE_REBOOT:
      return { icon: '🔄', text: 'BLE Reboot', class: 'event-system' }

    default:
      return { icon: '❓', text: `Unknown Event (0x${opcode.toString(16).toUpperCase()})`, class: 'event-unknown' }
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString()
}
</script>

<template>
  <div class="boks-demo">
    <!-- Connection Section -->
    <div class="card">
      <h3>1. Connection</h3>
      <div class="row">
        <button @click="connect" :disabled="isConnected" class="primary-btn">
          {{ isConnected ? 'Connected' : 'Scan & Connect' }}
        </button>
        <span v-if="isConnected" class="status success">Connected to {{ deviceName }}</span>
        <span v-else class="status">Not connected</span>
      </div>
    </div>

    <!-- History Actions -->
    <div class="card">
      <h3>2. History Sync</h3>
      <p>Retrieve the latest events from the device memory.</p>

      <button
        @click="fetchHistory"
        :disabled="!isConnected || isFetching"
        class="action-btn"
      >
        {{ isFetching ? 'Fetching...' : 'Sync History' }}
      </button>

      <div v-if="historyEvents.length > 0" class="history-table-container">
        <table class="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, idx) in historyEvents" :key="idx">
              <td class="date-col">{{ formatDate(event.date) }}</td>
              <td class="icon-col">{{ getEventDetails(event).icon }}</td>
              <td>
                <span :class="['event-badge', getEventDetails(event).class]">
                  {{ getEventDetails(event).text }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="!isFetching && isConnected" class="empty-state">
        <p>No history fetched yet. Click "Sync History".</p>
      </div>
    </div>

    <!-- Logs -->
    <div class="logs">
      <h4>Debug Logs</h4>
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

.action-btn {
  background-color: var(--vp-c-brand-1); /* Reusing brand color for main action */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.action-btn:disabled {
  background-color: var(--vp-c-gray-1);
  cursor: not-allowed;
}

.history-table-container {
  margin-top: 1.5rem;
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.history-table th,
.history-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
}

.history-table th {
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
}

.date-col {
  white-space: nowrap;
  font-family: monospace;
  color: var(--vp-c-text-2);
}

.icon-col {
  text-align: center;
  font-size: 1.2rem;
  width: 50px;
}

.event-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.event-open { background-color: rgba(16, 185, 129, 0.1); color: var(--vp-c-green-1); }
.event-close { background-color: rgba(100, 116, 139, 0.1); color: var(--vp-c-text-2); }
.event-success { background-color: rgba(16, 185, 129, 0.1); color: var(--vp-c-green-1); }
.event-warning { background-color: rgba(245, 158, 11, 0.1); color: var(--vp-c-yellow-1); }
.event-error { background-color: rgba(239, 68, 68, 0.1); color: var(--vp-c-red-1); }
.event-info { background-color: rgba(59, 130, 246, 0.1); color: var(--vp-c-brand-1); }
.event-system { background-color: rgba(100, 116, 139, 0.1); color: var(--vp-c-text-3); }
.event-unknown { background-color: rgba(100, 116, 139, 0.1); color: var(--vp-c-text-3); font-style: italic; }

.empty-state {
  margin-top: 1rem;
  color: var(--vp-c-text-2);
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.logs {
  background: var(--vp-c-bg-alt);
  border-radius: 8px;
  padding: 1rem;
}
.log-container {
  height: 150px;
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
