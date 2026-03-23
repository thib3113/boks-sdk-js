import { reactive, shallowRef, toRaw, markRaw } from 'vue';
import { BoksController } from '../../src/client/BoksController';
import { BoksClient } from '../../src/client/BoksClient';
import { BoksHardwareSimulator } from '../../src/simulator/BoksSimulator';
import { SimulatorTransport } from '../../src/simulator/SimulatorTransport';
import { BoksCodeType, BoksOpcode } from '../../src/protocol/constants';
import { bytesToHex } from '../../src/utils/converters';

export interface BoksLog {
  time: string;
  msg: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface BoksPacketLog {
  time: string;
  direction: 'TX' | 'RX';
  opcode: string;
  name: string;
  length: number;
  data?: any;
  rawData?: any;
}

export const boksStore = reactive({
  isConnected: false,
  isConnecting: false,
  useSimulator: false,
  isExpanded: false,
  deviceName: '',
  logs: [] as BoksLog[],
  packetLogs: [] as BoksPacketLog[],

  // Real/Sim device stats
  batteryLevel: 100,
  masterCodesCount: 0,
  singleCodesCount: 0,
  softwareVersion: '',
  firmwareVersion: '',

  // Master Key Vault
  activeMasterKey: '',
  keyHistory: [] as { key: string; configKey: string; date: string }[],

  // Instances
  controller: shallowRef<BoksController | null>(null),
  simulator: shallowRef<BoksHardwareSimulator | null>(null),

  getOpcodeName(opcode: number): string {
    return BoksOpcode[opcode] || 'UNKNOWN_OPCODE';
  },

  deriveConfigKey(masterKey: string): string {
    if (!masterKey || masterKey.length < 8) return '';
    return masterKey.substring(masterKey.length - 8).toUpperCase();
  },

  initVault() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('boks_vault');
    if (stored) {
      const data = JSON.parse(stored);
      this.activeMasterKey = data.activeKey || '';
      this.keyHistory = data.history || [];
    }
  },

  saveVault() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      'boks_vault',
      JSON.stringify({
        activeKey: this.activeMasterKey,
        history: this.keyHistory
      })
    );
  },

  setActiveKey(key: string) {
    this.activeMasterKey = key.toUpperCase();
    const configKey = this.deriveConfigKey(this.activeMasterKey);
    // Add to history if not already there
    if (!this.keyHistory.find((h) => h.key === this.activeMasterKey)) {
      this.keyHistory.unshift({
        key: this.activeMasterKey,
        configKey,
        date: new Date().toISOString()
      });
    }
    this.saveVault();
  },

  log(msg: string, type: BoksLog['type'] = 'info') {
    this.logs.unshift({
      time: new Date().toLocaleTimeString(),
      msg,
      type
    });

  },


  exportLogs() {
    if (typeof document === 'undefined') return;
    const exportedLogs = this.packetLogs.map(log => {
      let packetData;
      let rawPayloadHex;

      if (log.rawData) {
        packetData = log.rawData.toJSON ? log.rawData.toJSON() : JSON.parse(JSON.stringify(log.rawData));
        if (log.rawData.rawPayload) {
          rawPayloadHex = bytesToHex(log.rawData.rawPayload);
        }
      }

      if (packetData && typeof packetData === 'object') {
        delete packetData.opcode;
      }
      return {
        time: log.time,
        direction: log.direction,
        opcode: log.opcode,
        name: log.name,
        length: log.length,
        data: packetData,
        rawPayload: rawPayloadHex
      };
    });
    const dataStr = JSON.stringify(exportedLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boks-packet-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  logPacket(direction: 'TX' | 'RX', opcode: number, length: number, packet?: any) {
    const rawPacket = packet ? toRaw(packet) : undefined;
    const data: any = {};
    if (rawPacket) {
      // Extract interesting fields from common packets for the summary view
      if ('pinCode' in rawPacket) data.pin = rawPacket.pinCode;
      if ('pin' in rawPacket) data.pin = rawPacket.pin;
      if ('configKey' in rawPacket) data.key = rawPacket.configKey;
      if ('weight' in rawPacket) data.weight = `${rawPacket.weight}g`;
      if ('battery' in rawPacket) data.batt = `${rawPacket.battery}%`;
      if ('isOpen' in rawPacket) data.open = rawPacket.isOpen;
      if ('date' in rawPacket) data.time = rawPacket.date instanceof Date ? rawPacket.date.toLocaleTimeString() : rawPacket.date;
    }

    this.packetLogs.unshift({
      time: new Date().toLocaleTimeString(),
      direction,
      opcode: `0x${opcode.toString(16).padStart(2, "0").toUpperCase()}`,
      name: this.getOpcodeName(opcode),
      length,
      data: Object.keys(data).length > 0 ? data : undefined,
      rawData: rawPacket ? markRaw(rawPacket) : undefined
    });

  },

  async connect() {
    this.isConnecting = true;
    try {
      if (this.useSimulator) {
        this.log('Initializing Simulator...', 'info');
        const sim = new BoksHardwareSimulator();
        sim.addPinCode('123456', BoksCodeType.Multi);
        this.simulator = sim;

        const transport = new SimulatorTransport(sim);
        const client = new BoksClient({ transport });
        this.controller = new BoksController(client);

        client.on("*", (p, dir) => {
          this.logPacket(dir, p.opcode, p.rawPayload.length, p);
        });

        await this.controller.connect();
        this.deviceName = 'Boks Simulator';
        // Auto-set the active master key to the simulator's default so ConfigKey pre-fills
        if (sim) {
          const state = sim.getInternalState();
          const masterKeyHex = Array.from(state.masterKey).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
          this.setActiveKey(masterKeyHex);
        }
      } else {
        this.log('Requesting Bluetooth device...', 'info');
        const client = new BoksClient();
        this.controller = new BoksController(client);

        client.on("*", (p, dir) => {
          this.logPacket(dir, p.opcode, p.rawPayload.length, p);
        });

        await this.controller.connect();

        // Get the real BLE name if possible
        const bleName = (this.controller as any).client?.transport?.device?.name || 'Boks Device';
        this.deviceName = `${bleName} (${this.controller.hardwareInfo?.hardwareVersion || '?'})`;

        // Populate versions
        this.softwareVersion = this.controller.hardwareInfo?.softwareRevision || '';
        this.firmwareVersion = this.controller.hardwareInfo?.firmwareRevision || '';

        // Fetch initial status if possible (counts)
        this.controller.getBatteryLevel().then((l) => (this.batteryLevel = l || 0));
        this.controller.countCodes().then((c) => {
          this.masterCodesCount = c.master;
          this.singleCodesCount = c.singleUse;
        });
      }

      this.isConnected = true;
      this.log('Global Connection Established!', 'success');
    } catch (err: any) {
      this.log(`Connection failed: ${err.message}`, 'error');
      throw err;
    } finally {
      this.isConnecting = false;
    }
  },

  async disconnect() {
    if (this.controller) {
      await this.controller.disconnect();
      this.controller = null;
      this.simulator = null;
      this.isConnected = false;
      this.deviceName = '';
      this.log('Disconnected.', 'info');
    }
  }
});
