<script setup lang="ts">
import { boksStore } from '../boksStore'
</script>

<template>
  <div class="boks-info-banner" v-if="!boksStore.isConnected">
    <div class="banner-content">
      <span class="icon">💡</span>
      <p>
        To use these interactive examples, start the <strong>Simulator</strong> or <strong>Connect</strong> 
        a real device using the dashboard at the bottom of your screen.
      </p>
    </div>
  </div>
</template>

<style scoped>
.boks-info-banner {
  background-color: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  padding: 1rem;
  margin: 2rem 0;
}
.banner-content { display: flex; gap: 1rem; align-items: center; }
.icon { font-size: 1.5rem; }
.banner-content p { margin: 0; font-size: 0.9rem; color: var(--vp-c-text-1); }
</style>
