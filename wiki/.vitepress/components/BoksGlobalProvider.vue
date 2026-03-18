<script setup lang="ts">
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'
import { computed } from 'vue'

const props = defineProps<{
  minSw?: string
}>()

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

function compareSemVer(v1: string, v2: string): number {
  if (!v1 || !v2) return -1
  const p1 = v1.split('.').map(Number)
  const p2 = v2.split('.').map(Number)
  const len = Math.max(p1.length, p2.length)
  for (let i = 0; i < len; i++) {
    const n1 = p1[i] || 0
    const n2 = p2[i] || 0
    if (n1 > n2) return 1
    if (n1 < n2) return -1
  }
  return 0
}

const isVersionSupported = computed(() => {
  if (!props.minSw || !boksStore.isConnected) return true
  if (boksStore.useSimulator) return true // Simulator supports everything
  return compareSemVer(boksStore.softwareVersion, props.minSw) >= 0
})
</script>

<template>
  <div class="boks-info-banner" v-if="!boksStore.isConnected">
    <div class="banner-content">
      <span class="icon">💡</span>
      <p v-html="t.global.notConnectedBanner"></p>
    </div>
  </div>
  <div class="boks-warning-banner" v-else-if="!isVersionSupported">
    <div class="banner-content">
      <span class="icon">⚠️</span>
      <p>
        <strong>{{ t.global.unsupportedVersionTitle || 'Unsupported Version' }}</strong><br />
        {{ t.global.unsupportedVersionDesc || 'This feature requires a newer software version.' }}
        (Min: {{ props.minSw }}, Current: {{ boksStore.softwareVersion }})
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
.boks-warning-banner {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--vp-c-red-1);
  color: var(--vp-c-red-1);
  border-radius: 8px;
  padding: 1rem;
  margin: 2rem 0;
}
.banner-content { display: flex; gap: 1rem; align-items: center; }
.icon { font-size: 1.5rem; }
.banner-content p { margin: 0; font-size: 0.9rem; }
.boks-info-banner .banner-content p { color: var(--vp-c-text-1); }
</style>
