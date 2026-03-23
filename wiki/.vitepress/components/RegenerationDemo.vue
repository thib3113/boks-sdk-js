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
const currentConfigKey = ref('')
const hasPromptedLogs = ref(false)

onMounted(() => {
  if (boksStore.activeMasterKey) {
    currentConfigKey.value = boksStore.deriveConfigKey(boksStore.activeMasterKey)
  }
})

watch(() => boksStore.activeMasterKey, (newKey) => {
  if (newKey) {
    currentConfigKey.value = boksStore.deriveConfigKey(newKey)
  }
})

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

// Watch progress to prompt user to save logs and announce early acceptance
const hasAnnouncedAcceptance = ref(false)
watch(provisionProgress, (newVal) => {
  if (newVal > 0 && !hasPromptedLogs.value) {
    hasPromptedLogs.value = true
    boksStore.exportLogs()
  }
  if (newVal > 0 && !hasAnnouncedAcceptance.value) {
    hasAnnouncedAcceptance.value = true
    const newConfigKey = boksStore.deriveConfigKey(newMasterKey.value)
    boksStore.log(t.value.provision.acceptedMsg.replace('{key}', newConfigKey), 'success')
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
  if (!newMasterKey.value || !currentConfigKey.value) return

  if (!confirm(`${t.value.provision.confirm}\n\n${t.value.provision.confirmMultipleDownloads}`)) return

  isProvisioning.value = true
  provisionProgress.value = 0
  hasPromptedLogs.value = false
  hasAnnouncedAcceptance.value = false

  // Set credentials on controller
  try {
    boksStore.controller.setCredentials(currentConfigKey.value)
  } catch (err: any) {
    boksStore.log(`Invalid Config Key: ${err.message}`, 'error')
    isProvisioning.value = false
    return
  }

  // Anti-Brick Measure 1: Auto-Download Key
  downloadKey(newMasterKey.value)

  // Anti-Brick Measure 3: Prevent Navigation
  window.addEventListener('beforeunload', preventNav)

  boksStore.log('Starting provisioning...', 'warning')

  let hasProgress = false
  const progressTimer = setTimeout(() => {
    if (!hasProgress) {
      alert(t.value.provision.noProgressError || 'No response from the box after 5 seconds.\nPlease double-check that your Config Key is correct.\nNote: The box ignores invalid keys silently. You can use an NFC tag to easily retrieve the correct Config Key (NFC demo coming soon!).')
    }
  }, 5000)

  try {
    const success = await boksStore.controller.regenerateMasterKey(newMasterKey.value, (p) => {
      hasProgress = true
      provisionProgress.value = p
      boksStore.log(`Provisioning: ${p}%`, 'info')
    })

    clearTimeout(progressTimer)

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
          data-testid="generate-new-key-button"
        >
          {{ t.provision.generateNew }}
        </button>
      </div>

      <div class="field" style="margin-top: 1rem;">
        <label>{{ t.provision.currentConfigKey || 'Current Config Key (8 chars)' }}</label>
        <div class="value-row">
          <input type="text" v-model="currentConfigKey" maxlength="8" :placeholder="t.provision.enterConfigKey || 'Enter current 8-char Config Key'" :disabled="isProvisioning" data-testid="current-config-key-input" />
        </div>
      </div>

      <div class="field" style="margin-top: 1rem;">
        <label>{{ t.provision.newKey }}</label>
        <div class="value-row">
          <input type="text" v-model="newMasterKey" readonly :placeholder="t.provision.clickGenerateAbove" data-testid="new-master-key-input" />
        </div>
      </div>

            <button
        @click="provision"
        :disabled="!boksStore.isConnected || !isVersionSupported || isProvisioning || !newMasterKey || currentConfigKey.length !== 8"
        class="danger-btn big-btn"
        style="margin-top: 1rem;"
        data-testid="regenerate-seed-button"
      >
        {{ isProvisioning ? t.provision.provisioningBtn : t.provision.provisionBtn }}
      </button>

      <div style="margin-top: 1rem; text-align: center;">
        <p class="desc" style="margin-bottom: 0.5rem; font-size: 0.8rem;">{{ t.provision.downloadLogsDesc }}</p>
        <button
          @click="boksStore.exportLogs()"
          class="secondary-btn"
          style="width: 100%; font-weight: 500;"
        >
          ⬇️ {{ t.provision.downloadLogsBtn }}
        </button>
      </div>

      <div v-if="hasAnnouncedAcceptance" class="success-panel">
        <strong>✅ {{ t.provision.acceptedTitle || 'Key Accepted' }}</strong>
        <p>{{ t.provision.acceptedMsg.replace('{key}', boksStore.deriveConfigKey(newMasterKey)) }}</p>
      </div>
      <div v-if="isProvisioning || provisionProgress > 0" class="progress-bar-container">
        <label>{{ t.provision.progress }}</label>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="bar"><div class="fill" :style="{ width: provisionProgress + '%' }"></div></div>
          <span class="pct" data-testid="regeneration-progress-pct">{{ provisionProgress }}%</span>
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

.success-panel { background: rgba(16, 185, 129, 0.1); border: 1px solid var(--vp-c-green-1); color: var(--vp-c-green-2); padding: 1rem; border-radius: 8px; margin-top: 1rem; font-size: 0.9rem; }
.success-panel p { margin: 0.5rem 0 0 0; font-family: monospace; }

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
