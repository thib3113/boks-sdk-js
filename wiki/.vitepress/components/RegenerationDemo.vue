<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { boksStore } from '../boksStore'
import { useData } from 'vitepress'
import { i18n } from '../i18n'
import { precomputeBoksKeyContext, generateBoksPinFromContext } from '../../../src/crypto/pin-algorithm'
import { hexToBytes } from '../../../src/utils/converters'

const { lang } = useData()
const t = computed(() => i18n[lang.value as keyof typeof i18n] || i18n.en)

const isProvisioning = ref(false)
const provisionProgress = ref(0)
const newMasterKey = ref('')
const currentConfigKey = ref('')
const hasPromptedLogs = ref(false)
const verificationMode = ref(false)
const verificationCodeA = ref('')
const verificationCodeB = ref('')

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

// Disconnect listener to show alert if disconnected during provisioning
function onDisconnect() {
  if (isProvisioning.value) {
    alert(t.value.provision.disconnectionAlert || "WARNING: The Boks disconnected during provisioning! Please check the logs and DO NOT lose your recovery key file.")
    isProvisioning.value = false
    boksStore.isProvisioning = false
    window.removeEventListener('beforeunload', preventNav)
  }
}

async function provision() {
  if (!boksStore.controller || !boksStore.isConnected) return
  if (!newMasterKey.value || !currentConfigKey.value) return

  if (!confirm(`${t.value.provision.confirm}\n\n${t.value.provision.confirmMultipleDownloads}`)) return

  isProvisioning.value = true
  boksStore.isProvisioning = true // Update global store to stop background polling
  provisionProgress.value = 0
  hasPromptedLogs.value = false
  hasAnnouncedAcceptance.value = false

  // Set credentials on controller
  try {
    boksStore.controller.setCredentials(currentConfigKey.value)
  } catch (err: any) {
    boksStore.log(`Invalid Config Key: ${err.message}`, 'error')
    isProvisioning.value = false
    boksStore.isProvisioning = false
    return
  }

  // Anti-Brick Measure 1: Auto-Download Key
  downloadKey(newMasterKey.value)

  // Anti-Brick Measure 3: Prevent Navigation
  window.addEventListener('beforeunload', preventNav)

  boksStore.log('Starting provisioning...', 'warning')

  // Set up disconnection listener
  const controller = boksStore.controller as any;
  const client = controller._client || controller.client || controller['#client'] || (controller as any).client;

  // Also listen to the boksStore.isConnected property directly
  const unwatchConnected = watch(() => boksStore.isConnected, (connected) => {
      if (!connected) onDisconnect();
  });

  let hasProgress = false
  const progressTimer = setTimeout(() => {
    if (!hasProgress) {
      alert(t.value.provision.noProgressError || 'No response from the box after 5 seconds.\nPlease double-check that your Config Key is correct.\nNote: The box ignores invalid keys silently. You can use an NFC tag to easily retrieve the correct Config Key (NFC demo coming soon!).')
    }
  }, 5000)

  // Wait for 0xC0 (Success) or 0xC1 (Error) explicitly, as background polling is suspended
  let unbindNotification = () => {}
  const completionPromise = new Promise<boolean>((resolve) => {
    // client.on is our custom BoksClient method which returns an unsubscribe function
    try {
      if (client && typeof client.on === 'function') {
        unbindNotification = client.on('*', (packet: any) => {
          // Listen for 0xC2 (Progress) explicitly if needed, but BoksController handles it.
          if (packet.opcode === 0xC0) {
            resolve(true)
          } else if (packet.opcode === 0xC1) {
            resolve(false)
          }
        })
      }
    } catch (e) {
      // ignore
    }
  })

  // 40 second timeout to trigger verification mode
  let timeoutId: any;
  const timeoutPromise = new Promise<boolean>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('TIMEOUT_40S')), 40000)
  })

  try {
    verificationMode.value = false

    // We execute regenerateMasterKey
    const regenPromise = boksStore.controller.regenerateMasterKey(newMasterKey.value, (p) => {
      hasProgress = true
      provisionProgress.value = p
      boksStore.log(`Provisioning: ${p}%`, 'info')
    })

    // If client is bound, await the race, otherwise await regenerateMasterKey directly
    const processPromise = client ? Promise.race([regenPromise, completionPromise]) : regenPromise

    // Race against the 40s timeout
    const success = await Promise.race([processPromise, timeoutPromise])

    clearTimeout(timeoutId)
    clearTimeout(progressTimer)

    if (success) {
      boksStore.log('Provisioning complete! The device has a new Master Key.', 'success')
      alert(t.value.provision.successAlert)
      // Update store to reflect the new key as active
      boksStore.setActiveKey(newMasterKey.value)

      // Auto-reboot the Boks
      try {
        await boksStore.controller.reboot()
        boksStore.log('Rebooting device...', 'info')
      } catch(e) {
         // ignore if it fails to reboot
      }
    } else {
      boksStore.log('Provisioning failed (device reported error).', 'error')
    }
  } catch (err: any) {
    if (err.message === 'TIMEOUT_40S') {
       boksStore.log(t.value.provision.timeoutWarning || 'The process took longer than expected, verification is required.', 'warning')

       // Doubt Removal Procedure
       verificationMode.value = true

       // Code A: From the new chosen master key
       const newKeyBytes = hexToBytes(newMasterKey.value)
       const ctxA = precomputeBoksKeyContext(newKeyBytes)
       verificationCodeA.value = generateBoksPinFromContext(ctxA, 'single-use', 0)

       // Code B: With first 16 characters (8 bytes) as zero
       const modifiedKeyHex = '0000000000000000' + newMasterKey.value.substring(16)
       const ctxB = precomputeBoksKeyContext(hexToBytes(modifiedKeyHex))
       verificationCodeB.value = generateBoksPinFromContext(ctxB, 'single-use', 0)
    } else {
       boksStore.log(`Provisioning Error: ${err.message}`, 'error')
    }
  } finally {
    try {
      unbindNotification()
    } catch (e) {
      // Ignore if unbind fails
    }
    isProvisioning.value = false
    boksStore.isProvisioning = false // Resume background polling
    window.removeEventListener('beforeunload', preventNav)
    unwatchConnected()
  }
}
</script>

<template>
  <div class="demo-card">
    <div v-if="isProvisioning" class="warning-box" style="border-color: var(--vp-c-red-1);">
      <h3 class="danger-text" style="margin-top: 0;">⚠️ {{ t.provision.blockingTitle || 'DO NOT CLOSE THIS PAGE' }}</h3>
      <p style="margin-bottom: 0;">{{ t.provision.blockingDesc || 'Keep this window open and stay close to the Boks (1-2m). Background tasks have been suspended.' }}</p>
    </div>
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

      <div v-if="hasAnnouncedAcceptance && !verificationMode" class="success-panel">
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

      <!-- Verification Mode Panel -->
      <div v-if="verificationMode" class="warning-box" style="margin-top: 1rem;">
        <strong>⚠️ {{ t.provision.verificationTitle || 'Doubt Removal Procedure' }}</strong>
        <p style="font-size: 0.85rem; margin-top: 0.5rem; margin-bottom: 1rem;">
           {{ t.provision.verificationDesc || 'The device did not confirm the new key in the expected 40-second window. To determine which Master Key was saved, test the following two Single-Use codes on the physical keypad.' }}
        </p>

        <div class="field" style="margin-top: 0.5rem;">
          <label>{{ t.provision.codeALabel || 'Code A (New Master Key)' }}</label>
          <div class="value-row">
            <input type="text" :value="verificationCodeA" readonly />
          </div>
        </div>

        <div class="field" style="margin-top: 0.5rem;">
          <label>{{ t.provision.codeBLabel || 'Code B (Modified Key with zeroes)' }}</label>
          <div class="value-row">
            <input type="text" :value="verificationCodeB" readonly />
          </div>
        </div>

        <p style="font-size: 0.85rem; margin-top: 1rem; margin-bottom: 0;">
           <em>{{ t.provision.verificationInstruction || 'Whichever code opens the door indicates the key that the Boks has saved. If Code B works, see the Troubleshooting section above.' }}</em>
        </p>
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

.danger-text {
  color: var(--vp-c-red-1);
  margin-top: 0;
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
