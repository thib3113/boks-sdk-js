<script setup lang="ts">
import { ref } from 'vue'
import { boksStore } from '../boksStore'
import { BoksOpcode } from '../../../src/protocol/constants'

// Local State
const isFetching = ref(false)
const historyEvents = ref<any[]>([])

async function fetchHistory() {
  if (!boksStore.controller || !boksStore.isConnected) {
    alert('Please connect first using the Global Controller.')
    return
  }

  isFetching.value = true
  historyEvents.value = []
  boksStore.log('Fetching history from device memory...', 'info')

  try {
    const events = await boksStore.controller.fetchHistory()
    // Sort by date descending (newest first)
    historyEvents.value = events.sort((a: any, b: any) => b.date - a.date)
    boksStore.log(`Successfully fetched ${events.length} events.`, 'success')
  } catch (err: any) {
    boksStore.log(`Failed to fetch history: ${err.message}`, 'error')
  } finally {
    isFetching.value = false
  }
}

function getEventDetails(event: any) {
  const opcode = event.opcode
  switch (opcode) {
    case BoksOpcode.LOG_DOOR_OPEN: return { icon: '🚪', text: 'Door Opened', class: 'event-open' }
    case BoksOpcode.LOG_DOOR_CLOSE: return { icon: '🔒', text: 'Door Closed', class: 'event-close' }
    case BoksOpcode.LOG_CODE_BLE_VALID: return { icon: '📱', text: 'Valid App Code', class: 'event-success' }
    case BoksOpcode.LOG_CODE_KEY_VALID: return { icon: '🔢', text: 'Valid Keypad Code', class: 'event-success' }
    case BoksOpcode.LOG_EVENT_NFC_OPENING: return { icon: '💳', text: 'Valid NFC Tag', class: 'event-success' }
    case BoksOpcode.LOG_EVENT_KEY_OPENING: return { icon: '🔑', text: 'Physical Key', class: 'event-warning' }
    case BoksOpcode.POWER_ON: return { icon: '⚡', text: 'System Power On', class: 'event-system' }
    default: return { icon: '❓', text: `Event 0x${opcode.toString(16).toUpperCase()}`, class: 'event-unknown' }
  }
}

function formatDate(date: any) {
  return new Date(date).toLocaleString()
}
</script>

<template>
  <div class="demo-card">
    <div v-if="!boksStore.isConnected" class="warning-box">
      ⚠️ <strong>Not Connected</strong>. Please use the connection panel at the top of the page.
    </div>

    <div class="card">
      <h3>History Synchronization</h3>
      <p class="desc">Download and parse the internal event log of the Boks device.</p>

      <button
        @click="fetchHistory"
        :disabled="!boksStore.isConnected || isFetching"
        class="primary-btn"
      >
        {{ isFetching ? 'Fetching data...' : 'Sync History' }}
      </button>

      <div v-if="historyEvents.length > 0" class="history-table-container">
        <table class="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Event Description</th>
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
      
      <div v-else-if="!isFetching && boksStore.isConnected" class="empty-state">
        <p>No history fetched yet. Click "Sync History".</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-card { margin: 1rem 0; }
.card { border: 1px solid var(--vp-c-divider); background-color: var(--vp-c-bg-soft); border-radius: 8px; padding: 1.5rem; }
.warning-box { background-color: rgba(239, 68, 68, 0.1); color: var(--vp-c-red-1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--vp-c-red-1); }
.desc { font-size: 0.9rem; color: var(--vp-c-text-2); margin-bottom: 1.5rem; }
.primary-btn { background-color: var(--vp-c-brand-1); color: white; padding: 0.5rem 1rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 600; }
.primary-btn:disabled { background-color: var(--vp-c-gray-1); cursor: not-allowed; }
.history-table-container { margin-top: 1.5rem; overflow-x: auto; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
.history-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.history-table th, .history-table td { padding: 0.75rem; border-bottom: 1px solid var(--vp-c-divider); text-align: left; }
.history-table th { background: var(--vp-c-bg-alt); font-weight: 600; }
.date-col { white-space: nowrap; font-family: monospace; }
.icon-col { text-align: center; font-size: 1.1rem; width: 40px; }
.event-badge { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
.event-open { background-color: rgba(16, 185, 129, 0.1); color: var(--vp-c-green-1); }
.event-success { background-color: rgba(16, 185, 129, 0.1); color: var(--vp-c-green-1); }
.event-warning { background-color: rgba(245, 158, 11, 0.1); color: var(--vp-c-yellow-1); }
.event-system { background-color: rgba(100, 116, 139, 0.1); color: var(--vp-c-text-3); }
.empty-state { margin-top: 1rem; color: var(--vp-c-text-3); text-align: center; font-style: italic; }
</style>
