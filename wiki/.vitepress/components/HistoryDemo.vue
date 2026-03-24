<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { boksStore } from '../boksStore'
import { BoksOpcode } from '../../../src/protocol/constants'
import { useData } from 'vitepress'
import { i18n } from '../i18n'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

// Local State
const isFetching = ref(false)
const isFetchingPending = ref(false)
const historyEvents = ref<any[]>([])
const pendingLogs = ref<number | null>(null)

async function fetchPendingLogs() {
  if (!boksStore.controller || !boksStore.isConnected) {
    return
  }
  isFetchingPending.value = true
  try {
    const count = await boksStore.controller.getLogsCount()
    pendingLogs.value = count
  } catch (err: any) {
    boksStore.log(`Failed to fetch pending logs: ${err.message}`, 'error')
    pendingLogs.value = null
  } finally {
    isFetchingPending.value = false
  }
}

// Watch connection state to automatically fetch pending logs
watch(() => boksStore.isConnected, (connected) => {
  if (connected) {
    fetchPendingLogs()
  } else {
    pendingLogs.value = null
    historyEvents.value = []
  }
}, { immediate: true })

async function fetchHistory() {
  if (!boksStore.controller || !boksStore.isConnected) {
    alert(t.value.global.pleaseConnectFirst)
    return
  }

  isFetching.value = true
  historyEvents.value = []
  boksStore.log(t.value.history.fetchingMsg, 'info')

  try {
    const events = await boksStore.controller.fetchHistory()
    // Sort by date descending (newest first)
    historyEvents.value = events.sort((a: any, b: any) => b.date - a.date)
    boksStore.log(t.value.history.fetchSuccess.replace('{count}', String(events.length)), 'success')
  } catch (err: any) {
    boksStore.log(`Failed to fetch history: ${err.message}`, 'error')
  } finally {
    isFetching.value = false
  }
}

function getEventDetails(event: any) {
  const opcode = event.opcode
  switch (opcode) {
    case BoksOpcode.LOG_DOOR_OPEN: return { icon: '🚪', text: t.value.history.doorOpened, class: 'event-open' }
    case BoksOpcode.LOG_DOOR_CLOSE: return { icon: '🔒', text: t.value.history.doorClosed, class: 'event-close' }
    case BoksOpcode.LOG_CODE_BLE_VALID: return { icon: '📱', text: t.value.history.validAppCode, class: 'event-success' }
    case BoksOpcode.LOG_CODE_KEY_VALID: return { icon: '🔢', text: t.value.history.validKeypadCode, class: 'event-success' }
    case BoksOpcode.LOG_EVENT_NFC_OPENING: return { icon: '💳', text: t.value.history.validNfcTag, class: 'event-success' }
    case BoksOpcode.LOG_EVENT_KEY_OPENING: return { icon: '🔑', text: t.value.history.physicalKey, class: 'event-warning' }
    case BoksOpcode.POWER_ON: return { icon: '⚡', text: t.value.history.systemPowerOn, class: 'event-system' }
    default: return { icon: '❓', text: `Event 0x${opcode.toString(16).toUpperCase()}`, class: 'event-unknown' }
  }
}

function formatDate(date: any) {
  return new Date(date).toLocaleString()
}
</script>

<template>
  <div class="demo-card">
    <div v-if="!boksStore.isConnected" class="warning-box" v-html="t.global.notConnectedWarning"></div>

    <div class="card">
      <h3>{{ t.history.title }}</h3>
      <p class="desc">{{ t.history.desc }}</p>

      <div class="actions-row">
        <button
          @click="fetchHistory"
          :disabled="!boksStore.isConnected || isFetching"
          class="primary-btn"
          data-testid="sync-history-button"
        >
          {{ isFetching ? t.history.fetchingBtn : t.history.syncBtn }}
        </button>

        <div v-if="boksStore.isConnected" class="pending-logs-container">
          <span class="pending-badge" :class="{'has-logs': pendingLogs !== null && pendingLogs > 0}">
             {{ isFetchingPending ? t.history.fetchingCount : (pendingLogs !== null ? t.history.pendingLogs.replace('{count}', String(pendingLogs)) : t.history.pendingLogsUnknown) }}
          </span>
          <button @click="fetchPendingLogs" :disabled="isFetchingPending" class="icon-btn" :title="t.history.refreshPending">
            🔄
          </button>
        </div>
      </div>

      <div v-if="historyEvents.length > 0" class="history-table-container">
        <table class="history-table" data-testid="history-table">
          <thead>
            <tr>
              <th>{{ t.history.date }}</th>
              <th>{{ t.history.type }}</th>
              <th>{{ t.history.eventDesc }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, idx) in historyEvents" :key="idx" data-testid="history-row">
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
        <div class="empty-icon">📅</div>
        <h4>{{ t.history.noHistory }}</h4>
        <p class="empty-desc">{{ t.history.syncPrompt }}</p>
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
.actions-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
.pending-logs-container { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
.pending-badge { padding: 0.3rem 0.6rem; background-color: var(--vp-c-bg-alt); border-radius: 20px; color: var(--vp-c-text-2); }
.pending-badge.has-logs { background-color: rgba(16, 185, 129, 0.1); color: var(--vp-c-green-1); font-weight: 600; }
.icon-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.2rem; border-radius: 4px; transition: transform 0.2s; }
.icon-btn:hover:not(:disabled) { transform: rotate(15deg); background-color: var(--vp-c-bg-alt); }
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
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
.empty-state { margin-top: 2rem; padding: 2rem; color: var(--vp-c-text-3); text-align: center; background-color: var(--vp-c-bg-alt); border-radius: 8px; border: 1px dashed var(--vp-c-divider); }
.empty-icon { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.8; }
.empty-state h4 { margin: 0 0 0.5rem 0; color: var(--vp-c-text-1); }
.empty-desc { margin: 0; font-size: 0.9rem; }
</style>
