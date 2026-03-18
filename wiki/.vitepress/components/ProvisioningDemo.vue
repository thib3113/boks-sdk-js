<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

const isProvisioning = ref(false)
const provisionProgress = ref(0)
const newMasterKey = ref('')
const hasPromptedLogs = ref(false)

function generateKey() {
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  newMasterKey.value = hex
  boksStore.log('New random 32-byte key generated.', 'success')
}

// Check semantic version
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
  if (!boksStore.isConnected) return false
  if (boksStore.useSimulator) return true // Simulator supports everything
  return compareSemVer(boksStore.softwareVersion, '4.5.1') >= 0
})

// Watch progress to prompt user to save logs
watch(provisionProgress, (newVal) => {
  if (newVal > 0 && !hasPromptedLogs.value) {
    hasPromptedLogs.value = true
    alert(t.value.provision.saveLogsAlert)
  }
})

// Anti-Brick Measure 3: Prevent Navigation
const preventNav = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = ''
}

// Anti-Brick Measure 1: Auto-Download Key
function downloadKey(key: string) {
  const blob = new Blob([`Boks Recovery Key (DO NOT LOSE)\n\nKey: ${key}\nDate: ${new Date().toISOString()}`], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `boks-recovery-key-${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function provision() {
  if (!boksStore.controller || !boksStore.isConnected) return
  if (!newMasterKey.value) return
  if (!boksStore.activeMasterKey) {
    boksStore.log('Please set current credentials in Initialization tab first.', 'error')
    return
  }

  if (!confirm(t.value.provision.confirm)) return

  isProvisioning.value = true
  provisionProgress.value = 0
  hasPromptedLogs.value = false

  // Anti-Brick Measure 1: Auto-Download Key
  downloadKey(newMasterKey.value)

  // Anti-Brick Measure 3: Prevent Navigation
  window.addEventListener('beforeunload', preventNav)

  boksStore.log('Starting provisioning...', 'warning')

  try {
    const success = await boksStore.controller.regenerateMasterKey(newMasterKey.value, (p) => {
      provisionProgress.value = p
      boksStore.log(`Provisioning: ${p}%`, 'info')
    })

    if (success) {
      boksStore.log('Provisioning complete! The device has a new Master Key.', 'success')
      alert(t.value.provision.successAlert)
      // Update store to reflect the new key as active
      boksStore.setActiveKey(newMasterKey.value)
    } else {
      boksStore.log('Provisioning failed (device reported error).', 'error')
    }
  } catch (err: any) {
    boksStore.log(`Provisioning Error: ${err.message}`, 'error')
  } finally {
    isProvisioning.value = false
    window.removeEventListener('beforeunload', preventNav)
  }
}
</script>

<template>
  <div class="demo-card">
    <div v-if="!boksStore.isConnected" class="warning-box" v-html="t.global.notConnectedWarning"></div>
    <div v-else-if="!isVersionSupported" class="warning-box">
      <strong>⚠️ {{ t.provision.unsupportedVersion }}</strong><br>
      {{ t.provision.unsupportedVersionDesc }} ({{ boksStore.softwareVersion }} &lt; 4.5.1)
    </div>

    <div class="card action-card">
      <h3>{{ t.provision.title }}</h3>
      <p class="desc">{{ t.provision.desc }}</p>

      <div class="row">
        <button
          @click="generateKey"
          :disabled="isProvisioning"
          class="secondary-btn"
        >
          {{ t.provision.generateNew }}
        </button>
      </div>

      <div class="field" style="margin-top: 1rem;">
        <label>{{ t.provision.newKey }}</label>
        <div class="value-row">
          <input type="text" v-model="newMasterKey" readonly placeholder="Click generate button above" />
        </div>
      </div>

      <button
        @click="provision"
        :disabled="!boksStore.isConnected || !isVersionSupported || isProvisioning || !newMasterKey"
        class="danger-btn big-btn"
        style="margin-top: 1rem;"
      >
        {{ isProvisioning ? t.provision.provisioningBtn : t.provision.provisionBtn }}
      </button>

      <div v-if="isProvisioning || provisionProgress > 0" class="progress-bar-container">
        <label>{{ t.provision.progress }}</label>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="bar"><div class="fill" :style="{ width: provisionProgress + '%' }"></div></div>
          <span class="pct">{{ provisionProgress }}%</span>
        </div>
      </div>
    </div>

    <!-- Sponsoring Call -->
    <div class="sponsoring-card">
      <div class="sponsor-content">
        <span class="heart">💖</span>
        <div class="text">
          <p><strong>{{ t.provision.sponsorTitle }}</strong></p>
          <p>{{ t.provision.sponsorText }}</p>
          <a href="https://github.com/sponsors/thib3113" target="_blank" class="sponsor-link">{{ t.provision.sponsorLink }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-card { margin: 1rem 0; }
.card { border: 1px solid var(--vp-c-divider); background-color: var(--vp-c-bg-soft); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
.desc { font-size: 0.85rem; color: var(--vp-c-text-3); margin-bottom: 1rem; }
.row { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem; }
.field label { font-size: 0.75rem; color: var(--vp-c-text-2); text-transform: uppercase; font-weight: bold; }
.value-row { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.25rem; }
.value-row input { flex: 1; padding: 0.5rem; font-family: monospace; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.big-btn { width: 100%; padding: 0.75rem; font-weight: bold; }
.danger-btn { background: var(--vp-c-red-1); color: white; border: none; border-radius: 6px; cursor: pointer; }
.danger-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.secondary-btn { padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-alt); cursor: pointer; color: var(--vp-c-text-1); }
.secondary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.progress-bar-container { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.progress-bar-container label { font-size: 0.75rem; font-weight: bold; }
.bar { flex: 1; height: 8px; background: var(--vp-c-bg); border-radius: 4px; overflow: hidden; border: 1px solid var(--vp-c-divider); width: 100%; }
.fill { height: 100%; background: var(--vp-c-brand-1); transition: width 0.3s; }
.pct { font-size: 0.75rem; font-weight: bold; width: 30px; }
.warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--vp-c-red-1); color: var(--vp-c-red-1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }

/* Sponsoring Styles */
.sponsoring-card {
  margin-top: 2rem; padding: 1.5rem; border-radius: 12px;
  background: linear-gradient(135deg, var(--vp-c-brand-soft) 0%, var(--vp-c-bg-soft) 100%);
  border: 1px solid var(--vp-c-brand-1);
}
.sponsor-content { display: flex; gap: 1.5rem; align-items: center; }
.heart { font-size: 2.5rem; }
.text p { margin: 0 0 0.5rem 0; font-size: 0.9rem; }
.sponsor-link {
  display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem;
  background: var(--vp-c-brand-1); color: white; border-radius: 6px;
  text-decoration: none; font-weight: bold; font-size: 0.85rem;
}
.sponsor-link:hover { background: var(--vp-c-brand-2); color: white; }
</style>
