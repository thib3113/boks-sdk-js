<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

const isProvisioning = ref(false)
const provisionProgress = ref(0)
const newMasterKey = ref('')

onMounted(() => {
  boksStore.initVault()
})

function generateNewKey() {
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  newMasterKey.value = hex
  boksStore.log(t.value.regenerate.newKeyGen, 'success')
}

async function provisionNewKey() {
  if (!boksStore.controller || !boksStore.isConnected) return
  if (!boksStore.activeMasterKey) return
  if (!newMasterKey.value) return

  if (!window.confirm(t.value.regenerate.confirmProvision)) return

  isProvisioning.value = true
  provisionProgress.value = 0
  boksStore.log(t.value.regenerate.startProvisioning, 'warning')

  try {
    const success = await boksStore.controller.regenerateMasterKey(newMasterKey.value, (p) => {
      provisionProgress.value = p
    })

    if (success) {
      boksStore.log(t.value.regenerate.provisionSuccess, 'success')
      // Automatically activate the new master key since the old one is no longer valid
      boksStore.setActiveKey(newMasterKey.value)
      boksStore.controller.setCredentials(newMasterKey.value)
      newMasterKey.value = '' // clear
      alert(t.value.regenerate.successAlert)
    } else {
      boksStore.log(t.value.regenerate.provisionError, 'error')
    }
  } catch (err: any) {
    boksStore.log(`Provisioning Error: ${err.message}`, 'error')
  } finally {
    isProvisioning.value = false
  }
}

function copy(text: string) {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="demo-card">
    <div v-if="!boksStore.isConnected" class="warning-box" v-html="t.global.notConnectedWarning"></div>

    <!-- Active Key Card -->
    <div class="card">
      <div class="card-header">
        <h3>{{ t.regenerate.activeCredentials }}</h3>
      </div>

      <div v-if="boksStore.activeMasterKey" class="key-details">
        <div class="field">
          <label>{{ t.regenerate.currentMasterKey }}</label>
          <div class="value-row">
            <code>{{ boksStore.activeMasterKey }}</code>
            <button @click="copy(boksStore.activeMasterKey)" class="icon-btn">📋</button>
          </div>
        </div>
        <div class="field">
          <label>{{ t.regenerate.configKey }}</label>
          <div class="value-row">
            <code>{{ boksStore.deriveConfigKey(boksStore.activeMasterKey) }}</code>
            <button @click="copy(boksStore.deriveConfigKey(boksStore.activeMasterKey))" class="icon-btn">📋</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">{{ t.regenerate.emptyCredentials }}</div>
    </div>

    <!-- Provisioning Action -->
    <div class="card action-card" v-if="boksStore.activeMasterKey">
      <h3>{{ t.regenerate.provisioning }}</h3>
      <p class="desc">{{ t.regenerate.provisioningDesc }}</p>

      <div style="margin-bottom: 1rem;">
        <button @click="generateNewKey" class="secondary-btn" :disabled="isProvisioning">{{ t.regenerate.generateNewBtn }}</button>
      </div>

      <div class="field" v-if="newMasterKey" style="margin-bottom: 1.5rem;">
        <label>{{ t.regenerate.newMasterKeyLabel }}</label>
        <div class="value-row">
          <code>{{ newMasterKey }}</code>
        </div>
      </div>

      <button
        @click="provisionNewKey"
        :disabled="!boksStore.isConnected || isProvisioning || !newMasterKey"
        class="danger-btn big-btn"
      >
        {{ isProvisioning ? t.regenerate.provisioningBtn : t.regenerate.provisionBtn }}
      </button>

      <div v-if="isProvisioning || provisionProgress > 0" class="progress-bar-container">
        <label style="font-size: 0.8rem; font-weight: bold;">{{ t.regenerate.provisioningProgress }}</label>
        <div class="bar"><div class="fill" :style="{ width: provisionProgress + '%' }"></div></div>
        <span class="pct">{{ provisionProgress }}%</span>
      </div>
    </div>

    <!-- Sponsoring Call -->
    <div class="sponsoring-card">
      <div class="sponsor-content">
        <span class="heart">💖</span>
        <div class="text">
          <p><strong>{{ t.regenerate.sponsorTitle }}</strong></p>
          <p>{{ t.regenerate.sponsorText }}</p>
          <a href="https://github.com/sponsors/thib3113" target="_blank" class="sponsor-link">{{ t.regenerate.sponsorLink }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-card { margin: 1rem 0; }
.card { border: 1px solid var(--vp-c-divider); background-color: var(--vp-c-bg-soft); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-header h3 { margin: 0; font-size: 1rem; }
.key-details { display: flex; flex-direction: column; gap: 1rem; }
.field label { font-size: 0.75rem; color: var(--vp-c-text-2); text-transform: uppercase; font-weight: bold; }
.value-row { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.25rem; }
.value-row code { flex: 1; word-break: break-all; font-family: monospace; font-size: 0.85rem; color: var(--vp-c-brand-1); }
.icon-btn { background: none; border: 1px solid var(--vp-c-divider); padding: 0.2rem 0.4rem; border-radius: 4px; cursor: pointer; }
.desc { font-size: 0.85rem; color: var(--vp-c-text-3); margin-bottom: 1rem; }
.big-btn { width: 100%; padding: 0.75rem; font-weight: bold; }
.danger-btn { background: var(--vp-c-red-1); color: white; border: none; border-radius: 6px; cursor: pointer; }
.danger-btn:disabled { opacity: 0.5; }
.progress-bar-container { margin-top: 1rem; display: flex; align-items: center; gap: 1rem; }
.bar { flex: 1; height: 8px; background: var(--vp-c-bg); border-radius: 4px; overflow: hidden; border: 1px solid var(--vp-c-divider); }
.fill { height: 100%; background: var(--vp-c-brand-1); transition: width 0.3s; }
.pct { font-size: 0.75rem; font-weight: bold; width: 30px; }
.warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--vp-c-red-1); color: var(--vp-c-red-1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
.secondary-btn { padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); cursor: pointer; background: var(--vp-c-bg-alt); font-weight: 500;}
.secondary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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