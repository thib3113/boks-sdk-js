<script setup lang="ts">
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'
import { computed } from 'vue'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)
</script>

<template>
  <div class="boks-info-banner" v-if="!boksStore.isConnected">
    <div class="banner-content">
      <span class="icon">💡</span>
      <p v-html="t.global.notConnectedBanner"></p>
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
