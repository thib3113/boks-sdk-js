<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { BoksController } from '../../../src/client/BoksController'
import { WebBluetoothTransport } from '../../../src/client/WebBluetoothTransport'

// State
const isClient = typeof window !== 'undefined'
const masterKey = ref('')
const keyHistory = ref([])
const isConnected = ref(false)
const deviceName = ref('')
const logs = ref([])
const isInitializing = ref(false)
const initProgress = ref(0)
const showHistory = ref(false)

let controller = null

// Load from Storage
onMounted(() => {
  if (isClient) {
    const storedKey = localStorage.getItem('boks_master_key')
    if (storedKey) {
      masterKey.value = storedKey
      log('Loaded existing Master Key from storage.', 'success')
    }

    const storedHistory = localStorage.getItem('boks_key_history')
    if (storedHistory) {
      try {
        keyHistory.value = JSON.parse(storedHistory)
      } catch (e) {
        console.error('Failed to parse history', e)
      }
    }
  }
})

// Watchers for persistence
watch(masterKey, (newVal) => {
  if (isClient && newVal) {
    localStorage.setItem('boks_master_key', newVal)
  }
})

watch(keyHistory, (newVal) => {
  if (isClient) {
    localStorage.setItem('boks_key_history', JSON.stringify(newVal))
  }
}, { deep: true })

// Methods
function log(msg, type = 'info') {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    msg,
    type
  })
  // Scroll to bottom logic would go here
}

async function connect() {
  if (!isClient) return

  try {
    log('Requesting Bluetooth device...')
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'Boks' }],
      optionalServices: [
        'a7630001-f491-4f21-95ea-846ba586e361', // Boks Service
        '0000180a-0000-1000-8000-00805f9b34fb'  // Device Info
      ]
    })

    log(`Device selected: ${device.name}`)

    // Create controller with WebBluetooth transport
    controller = new BoksController({ transport: new WebBluetoothTransport(device) })

    log('Connecting...')
    await controller.connect()

    isConnected.value = true
    deviceName.value = device.name
    log('Connected successfully!', 'success')

  } catch (err) {
    log(`Connection failed: ${err.message}`, 'error')
    console.error(err)
  }
}

function generateKey() {
  if (masterKey.value) {
    if (!confirm('A Master Key already exists! Are you sure you want to generate a new one? The old one will be moved to history but this is risky if you have already initialized a device with it.')) {
      return
    }
  }

  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  const hex = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

  // Save old key to history if it existed (though we usually just append new ones)
  // Actually, let's just append the new one to history.

  masterKey.value = hex

  keyHistory.value.unshift({
    key: hex,
    date: new Date().toISOString()
  })

  log('New Master Key generated and saved.', 'success')
}

async function initializeDevice() {
  if (!controller || !isConnected.value) return
  if (!masterKey.value) {
    alert('No Master Key available!')
    return
  }

  if (!confirm('CRITICAL WARNING: This will initialize the connected Boks device with the displayed Master Key. This operation cannot be undone easily. Ensure you have backed up this key. Continue?')) {
    return
  }

  isInitializing.value = true
  initProgress.value = 0
  log('Starting initialization...', 'warning')

  try {
    // Assuming the SDK exposes initialize() on the controller
    // Note: The user mentioned 'initialize(seed)' earlier.
    const success = await controller.initialize(masterKey.value) //, (p) => initProgress.value = p)

    if (success) {
      log('Initialization complete! Device is now paired with this Master Key.', 'success')
      alert('Success! Device Initialized.')
    } else {
      log('Initialization failed (device reported error).', 'error')
    }
  } catch (err) {
    log(`Initialization error: ${err.message}`, 'error')
  } finally {
    isInitializing.value = false
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
  log('Copied to clipboard', 'success')
}

function clearStorage() {
  if (confirm('DANGER: This will delete your Master Key from browser storage. If you lose this key, you may lose access to your device. Are you sure?')) {
    localStorage.removeItem('boks_master_key')
    masterKey.value = ''
    log('Storage cleared.', 'warning')
  }
}

function restoreKey(k) {
  if (confirm('Restore this key from history as the active Master Key?')) {
    masterKey.value = k
    log('Key restored from history.', 'success')
  }
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

    <!-- Key Management Section -->
    <div class="card">
      <h3>2. Master Key Management</h3>
      <div v-if="masterKey" class="key-display">
        <p class="label">Active Master Key (Saved in Storage)</p>
        <div class="key-box">
          <code>{{ masterKey }}</code>
          <button @click="copyToClipboard(masterKey)" class="icon-btn" title="Copy">📋</button>
        </div>
        <p class="warning-text">⚠️ Do not lose this key. It is required to control your device.</p>
      </div>

      <div v-else class="empty-state">
        <p>No Master Key found. Generate one to proceed.</p>
      </div>

      <div class="actions">
        <button
          @click="generateKey"
          :class="['action-btn', { 'secondary-btn': masterKey, 'primary-btn': !masterKey }]"
        >
          {{ masterKey ? 'Regenerate Key (Risky)' : 'Generate New Master Key' }}
        </button>

        <button v-if="masterKey" @click="clearStorage" class="danger-btn text-only">
          Clear Storage
        </button>
      </div>

      <!-- History Toggle -->
      <div class="history-section">
        <button @click="showHistory = !showHistory" class="text-btn">
          {{ showHistory ? 'Hide History' : 'Show Key History' }} ({{ keyHistory.length }})
        </button>

        <div v-if="showHistory && keyHistory.length > 0" class="history-list">
          <div v-for="(item, idx) in keyHistory" :key="idx" class="history-item">
            <span class="date">{{ new Date(item.date).toLocaleString() }}</span>
            <code class="mini-key">{{ item.key.substring(0, 8) }}...</code>
            <button @click="restoreKey(item.key)" class="small-btn">Restore</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Initialization Section -->
    <div class="card">
      <h3>3. Device Initialization</h3>
      <p>Initialize the connected device with the Active Master Key.</p>

      <button
        @click="initializeDevice"
        :disabled="!isConnected || !masterKey || isInitializing"
        class="danger-btn big-btn"
      >
        {{ isInitializing ? 'Initializing...' : 'Initialize Device' }}
      </button>

      <div v-if="isInitializing" class="progress-bar">
        <div class="fill" :style="{ width: initProgress + '%' }"></div>
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

.status {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
.status.success { color: var(--vp-c-green-1); }

.key-display {
  background: var(--vp-c-bg-alt);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.key-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--vp-c-bg);
  padding: 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
}

.warning-text {
  color: var(--vp-c-yellow-1);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.history-section {
  margin-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 1rem;
}

.history-list {
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.9rem;
}

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

.danger-btn {
  background-color: var(--vp-c-red-1);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.danger-btn.text-only {
  background: none;
  color: var(--vp-c-red-1);
  padding: 0.5rem;
}

.text-btn {
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
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
