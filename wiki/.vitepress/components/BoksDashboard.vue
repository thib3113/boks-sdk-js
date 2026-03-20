<script setup lang="ts">
import { boksStore } from '../boksStore'
import DashboardHeader from './DashboardHeader.vue'
import DeviceStatus from './DeviceStatus.vue'
import PacketViewer from './PacketViewer.vue'
</script>

<template>
  <div :class="['sdk-dashboard', { expanded: boksStore.isExpanded }]">
    <DashboardHeader />

    <div v-if="boksStore.isExpanded" class="dashboard-content">
      <DeviceStatus />
      <PacketViewer />
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

.dashboard-content { height: 360px; display: grid; grid-template-columns: 400px 1fr; }

@media (max-width: 768px) {
  .sdk-dashboard.expanded { height: 80vh; }
  .dashboard-content { grid-template-columns: 1fr; grid-template-rows: auto 1fr; height: calc(80vh - 40px); }
}
</style>
