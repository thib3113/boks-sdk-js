<script setup lang="ts">
import { computed } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

async function toggleConnection() {
  if (boksStore.isConnected) {
    await boksStore.disconnect()
  } else {
    try {
      await boksStore.connect()
    } catch (e) {}
  }
}
</script>

<template>
  <div class="dashboard-header" @click="boksStore.isExpanded = !boksStore.isExpanded" data-testid="dashboard-header">
    <div class="title">
      📡 {{ t.logger.title }}
      <span class="target-name" v-if="boksStore.isConnected"> — {{ boksStore.deviceName }}</span>
    </div>

    <div class="header-actions">
      <label class="sim-switch" @click.stop v-if="!boksStore.isConnected" :title="t.logger.simulator">
        <div class="switch-control">
          <input type="checkbox" v-model="boksStore.useSimulator" id="simToggle" data-testid="simulator-checkbox">
          <div class="slider round"></div>
        </div>
        <span>{{ t.logger.simulator }}</span>
      </label>

      <button @click.stop="toggleConnection" :class="['action-btn-main', { connected: boksStore.isConnected, loading: boksStore.isConnecting }]" data-testid="connect-button">
        <span v-if="boksStore.isConnecting" class="spinner">⏳</span>
        <span :class="{ 'desktop-only': boksStore.isConnecting }">{{ boksStore.isConnecting ? t.logger.working : (boksStore.isConnected ? t.logger.disconnect : (boksStore.useSimulator ? t.logger.start : t.logger.connect)) }}</span>
      </button>

      <span class="arrow">{{ boksStore.isExpanded ? '▼' : '▲' }}</span>
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  padding: 0.5rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; background: var(--vp-c-bg-alt); user-select: none; border-bottom: 1px solid var(--vp-c-divider);
}

.title { font-weight: bold; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; color: var(--vp-c-text-1); }
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

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
}
</style>
