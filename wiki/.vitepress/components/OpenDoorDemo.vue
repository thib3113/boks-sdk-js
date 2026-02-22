<script setup lang="ts">
import { ref } from 'vue'
import { boksStore } from '../boksStore'

// Local State for this demo
const pinCode = ref('123456')
const isOpening = ref(false)
const doorStatus = ref<boolean | null>(null)

async function openDoor() {
  if (!boksStore.controller || !boksStore.isConnected) {
    alert('Please connect first using the Global Controller.')
    return
  }
  
  if (!pinCode.value || pinCode.value.length !== 6) {
    boksStore.log('PIN must be exactly 6 characters.', 'warning')
    return
  }

  isOpening.value = true
  boksStore.log(`Attempting to open door with PIN "${pinCode.value}"...`, 'info')

  try {
    const success = await boksStore.controller.openDoor(pinCode.value)
    if (success) {
      boksStore.log('Door opened successfully!', 'success')
      await checkStatus()
      // Simulator auto-closes after 10s, refresh to show it
      setTimeout(checkStatus, 5000)
      setTimeout(checkStatus, 11000)
    } else {
      boksStore.log('Failed to open door. Invalid PIN?', 'error')
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
    boksStore.log(`Door is ${isOpen ? 'OPEN' : 'CLOSED'}`, isOpen ? 'warning' : 'info')
  } catch (err: any) {
    boksStore.log(`Failed to get status: ${err.message}`, 'error')
  }
}
</script>

<template>
  <div class="demo-card">
    <div v-if="!boksStore.isConnected" class="warning-box">
      ⚠️ <strong>Not Connected</strong>. Please use the connection panel at the top of the page.
    </div>

    <div class="card">
      <h3>Open Door Command</h3>
      <p class="desc">Send a standard open command using a 6-digit PIN code.</p>
      
      <div class="control-row">
        <div class="input-group">
          <label>PIN Code</label>
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
          {{ isOpening ? 'Opening...' : 'Open Door' }}
        </button>
      </div>

      <div class="status-display" v-if="boksStore.isConnected && doorStatus !== null">
        Current State:
        <span :class="['badge', doorStatus ? 'open' : 'closed']">
          {{ doorStatus ? 'OPEN' : 'CLOSED' }}
        </span>
        <button @click="checkStatus" class="icon-btn" title="Refresh Status">🔄</button>
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
