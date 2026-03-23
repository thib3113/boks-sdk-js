<script setup lang="ts">
import { ref, computed } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

const showClearConfirm = ref(false)

function exportLogs() {
  boksStore.exportLogs();
}
</script>

<template>
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
.log-section { display: flex; flex-direction: column; overflow: hidden; background: var(--vp-c-bg); height: 100%; }

.section-header { padding: 0.4rem 1rem; background: var(--vp-c-bg); border-bottom: 1px solid var(--vp-c-divider); display: flex; justify-content: space-between; align-items: center; }
.section-header h4 { margin: 0; font-size: 0.7rem; text-transform: uppercase; color: var(--vp-c-text-3); letter-spacing: 0.5px; }
.section-header-actions { display: flex; gap: 0.5rem; align-items: center; }

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

.action-btn { background: none; border: none; color: var(--vp-c-text-2); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0.2rem; border-radius: 4px; transition: color 0.2s, background 0.2s; }
.action-btn:hover { color: var(--vp-c-brand-1); background: var(--vp-c-bg-soft); }
.clear-btn { background: none; border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-3); cursor: pointer; font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; padding: 2rem; text-align: center; color: var(--vp-c-text-3);
}
.empty-state p { margin: 0.5rem 0 0.25rem 0; font-weight: 600; color: var(--vp-c-text-2); font-size: 0.85rem; }
.empty-state span { font-size: 0.7rem; opacity: 0.7; }
.pulse-icon { font-size: 1.5rem; animation: pulse 2s infinite ease-in-out; }
@keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }

.json-data { margin: 0; padding: 0.4rem; background: var(--vp-c-bg-alt); border-radius: 4px; font-size: 0.7rem; max-height: 150px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; }

@media (max-width: 768px) {
  .log-table th.op-col, .log-table td.op { display: none; }
  .log-table th.time-col, .log-table td.time { width: 60px; }
  .log-table td.name { font-size: 0.6rem; word-break: break-word; }
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
.modal-content p { margin: 0 0 1.5rem 0; font-size: 0.85rem; color: var(--vp-c-text-2); }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
.modal-btn { padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: 600; }
.modal-btn.cancel { background: var(--vp-c-bg-alt); border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2); }
.modal-btn.confirm { background: var(--vp-c-red-1); border: none; color: white; }
</style>
