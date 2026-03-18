<script setup lang="ts">
import { ref, computed } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

// Local State for this demo
const pinCode = ref('123456')
const isOpening = ref(false)
const doorStatus = ref<boolean | null>(null)

async function openDoor() {
  if (!boksStore.controller || !boksStore.isConnected) {
    alert(t.value.global.pleaseConnectFirst)
    return
  }
  
  if (!pinCode.value || pinCode.value.length !== 6) {
    boksStore.log(t.value.openDoor.pinLengthWarning, 'warning')
    return
  }

  isOpening.value = true
  boksStore.log(t.value.openDoor.attemptingOpen.replace('{pin}', pinCode.value), 'info')

  try {
    const success = await boksStore.controller.openDoor(pinCode.value)
    if (success) {
      boksStore.log(t.value.openDoor.openSuccess, 'success')
      await checkStatus()
      // Simulator auto-closes after 10s, refresh to show it
      setTimeout(checkStatus, 5000)
      setTimeout(checkStatus, 11000)
    } else {
      boksStore.log(t.value.openDoor.openFailed, 'error')
    }
  } catch (err: any) {
    boksStore.log(`Error opening door: ${err.message}`, 'error')
  } finally {
    isOpening.value = false
  }
}

async function checkStatus() {
  if (!boksStore.controller || !boksStore.isConnected) return
  try {
    const isOpen = await boksStore.controller.getDoorStatus()
    doorStatus.value = isOpen
    boksStore.log(t.value.openDoor.doorStateMsg.replace('{state}', isOpen ? 'OPEN' : 'CLOSED'), isOpen ? 'warning' : 'info')
  } catch (err: any) {
    boksStore.log(`Failed to get status: ${err.message}`, 'error')
  }
}
</script>

<template>
  <div class="demo-card">
    <div v-if="!boksStore.isConnected" class="warning-box" v-html="t.global.notConnectedWarning"></div>

    <div class="card">
      <h3>{{ t.openDoor.title }}</h3>
      <p class="desc">{{ t.openDoor.desc }}</p>
      
      <div class="control-row">
        <div class="input-group">
          <label>{{ t.openDoor.pinCode }}</label>
          <input
            v-model="pinCode"
            type="text"
            maxlength="6"
            placeholder="123456"
            :disabled="!boksStore.isConnected || isOpening"
          >
        </div>

        <button
          @click="openDoor"
          :disabled="!boksStore.isConnected || isOpening || pinCode.length !== 6"
          class="primary-btn big-btn"
        >
          {{ isOpening ? t.openDoor.openingBtn : t.openDoor.openBtn }}
        </button>
      </div>

      <div class="status-display" v-if="boksStore.isConnected && doorStatus !== null">
        {{ t.openDoor.currentState }}
        <span :class="['badge', doorStatus ? 'open' : 'closed']">
          {{ doorStatus ? 'OPEN' : 'CLOSED' }}
        </span>
        <button @click="checkStatus" class="icon-btn" :title="t.openDoor.refreshStatus">🔄</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-card { margin: 1rem 0; }
.card { border: 1px solid var(--vp-c-divider); background-color: var(--vp-c-bg-soft); border-radius: 8px; padding: 1.5rem; }
.warning-box { background-color: rgba(239, 68, 68, 0.1); color: var(--vp-c-red-1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--vp-c-red-1); }
.desc { font-size: 0.9rem; color: var(--vp-c-text-2); margin-bottom: 1.5rem; }
.control-row { display: flex; align-items: flex-end; gap: 1rem; }
.input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-group label { font-size: 0.8rem; font-weight: 600; color: var(--vp-c-text-2); }
.input-group input { padding: 0.5rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-family: monospace; font-size: 1.1rem; width: 120px; text-align: center; letter-spacing: 2px; }
.status-display { display: flex; align-items: center; gap: 0.5rem; margin-top: 1.5rem; font-weight: 500; }
.badge { padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
.badge.open { background-color: var(--vp-c-yellow-soft); color: var(--vp-c-yellow-1); }
.badge.closed { background-color: var(--vp-c-green-soft); color: var(--vp-c-green-1); }
.primary-btn { background-color: var(--vp-c-brand-1); color: white; padding: 0.5rem 1rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 600; }
.primary-btn:disabled { background-color: var(--vp-c-gray-1); cursor: not-allowed; opacity: 0.7; }
.big-btn { padding: 0.6rem 1.5rem; font-size: 1rem; }
.icon-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
.text-btn { background: none; border: none; color: var(--vp-c-brand-1); cursor: pointer; font-size: 0.8rem; }
</style>
