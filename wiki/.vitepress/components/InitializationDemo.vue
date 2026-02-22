<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { boksStore } from '../boksStore'

const isInitializing = ref(false)
const initProgress = ref(0)
const showHistory = ref(false)

onMounted(() => {
  boksStore.initVault()
})

function generateKey() {
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  boksStore.setActiveKey(hex)
  boksStore.log('New Master Key generated.', 'success')
}

async function initialize() {
  if (!boksStore.controller || !boksStore.isConnected) return
  if (!boksStore.activeMasterKey) return

  isInitializing.value = true
  initProgress.value = 0
  boksStore.log('Starting initialization...', 'warning')

  try {
    const success = await boksStore.controller.initialize(boksStore.activeMasterKey, (p) => {
      initProgress.value = p
    })

    if (success) {
      boksStore.log('Device initialized!', 'success')
      boksStore.controller.setCredentials(boksStore.activeMasterKey)
      alert('Success! Your Boks is now configured.')
    } else {
      boksStore.log('Device reported an error.', 'error')
    }
  } catch (err: any) {
    boksStore.log(`Init Error: ${err.message}`, 'error')
  } finally {
    isInitializing.value = false
  }
}

function copy(text: string) {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="demo-card">
    <div v-if="!boksStore.isConnected" class="warning-box">
      ⚠️ <strong>Not Connected</strong>. Please use the connection panel at the top.
    </div>

    <!-- Active Key Card -->
    <div class="card">
      <div class="card-header">
        <h3>1. Active Credentials</h3>
        <button @click="generateKey" class="secondary-btn small">Generate New</button>
      </div>

      <div v-if="boksStore.activeMasterKey" class="key-details">
        <div class="field">
          <label>Master Key (32 bytes)</label>
          <div class="value-row">
            <code>{{ boksStore.activeMasterKey }}</code>
            <button @click="copy(boksStore.activeMasterKey)" class="icon-btn">📋</button>
          </div>
        </div>
        <div class="field">
          <label>Config Key (derived)</label>
          <div class="value-row">
            <code>{{ boksStore.deriveConfigKey(boksStore.activeMasterKey) }}</code>
            <button @click="copy(boksStore.deriveConfigKey(boksStore.activeMasterKey))" class="icon-btn">📋</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">Click "Generate New" to create your credentials.</div>
    </div>

    <!-- Initialization Action -->
    <div class="card action-card" v-if="boksStore.activeMasterKey">
      <h3>2. Provisioning</h3>
      <p class="desc">Send the active Master Key to the Boks device.</p>
      
      <button 
        @click="initialize" 
        :disabled="!boksStore.isConnected || isInitializing" 
        class="danger-btn big-btn"
      >
        {{ isInitializing ? 'Initializing...' : 'Initialize Boks Device' }}
      </button>

      <div v-if="isInitializing" class="progress-bar-container">
        <div class="bar"><div class="fill" :style="{ width: initProgress + '%' }"></div></div>
        <span class="pct">{{ initProgress }}%</span>
      </div>
    </div>

    <!-- History -->
    <div class="history-toggle" v-if="boksStore.keyHistory.length">
      <button @click="showHistory = !showHistory" class="text-btn">
        {{ showHistory ? 'Hide Vault' : '📜 View Key Vault' }} ({{ boksStore.keyHistory.length }})
      </button>
      
      <div v-if="showHistory" class="vault-list">
        <table class="vault-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Master Key (Start)</th>
              <th>Config Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in boksStore.keyHistory" :key="item.key">
              <td>{{ new Date(item.date).toLocaleDateString() }}</td>
              <td>
                <div class="h-value-row">
                  <code>{{ item.key }}</code>
                  <button @click="copy(item.key)" class="icon-btn tiny">📋</button>
                </div>
              </td>
              <td><code>{{ item.configKey }}</code></td>
              <td><button @click="boksStore.activeMasterKey = item.key" class="small-btn">Set Active</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sponsoring Call -->
    <div class="sponsoring-card">
      <div class="sponsor-content">
        <span class="heart">💖</span>
        <div class="text">
          <p><strong>Support this development</strong></p>
          <p>Hardware initialization is a critical feature that we currently cannot test on real devices. Your donations help us buy hardware to validate these experimental features safely.</p>
          <a href="https://github.com/sponsors/thib3113" target="_blank" class="sponsor-link">Become a Sponsor on GitHub</a>
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
.history-toggle { margin-top: 1.5rem; text-align: center; }
.vault-list { margin-top: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; overflow: hidden; }
.vault-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; background: var(--vp-c-bg); }
.vault-table th, .vault-table td { padding: 0.5rem; text-align: left; border-bottom: 1px solid var(--vp-c-divider); }
.vault-table th { background: var(--vp-c-bg-alt); }
.warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--vp-c-red-1); color: var(--vp-c-red-1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
.small-btn { padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-alt); cursor: pointer; }
.h-value-row { display: flex; gap: 0.5rem; align-items: center; }
.icon-btn.tiny { padding: 0.1rem 0.25rem; font-size: 0.7rem; }
.secondary-btn { padding: 0.3rem 0.6rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); cursor: pointer; }

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
