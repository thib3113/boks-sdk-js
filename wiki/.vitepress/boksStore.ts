import { reactive, shallowRef } from 'vue'
import { BoksController } from '../../src/client/BoksController'
import { BoksClient } from '../../src/client/BoksClient'
import { BoksHardwareSimulator } from '../../src/simulator/BoksSimulator'
import { SimulatorTransport } from '../../src/simulator/SimulatorTransport'
import { BoksCodeType, BoksOpcode } from '../../src/protocol/constants'

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
}

export const boksStore = reactive({
  isConnected: false,
  isConnecting: false,
  useSimulator: true,
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
  keyHistory: [] as { key: string, configKey: string, date: string }[],

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
    localStorage.setItem('boks_vault', JSON.stringify({
      activeKey: this.activeMasterKey,
      history: this.keyHistory
    }));
  },

  setActiveKey(key: string) {
    this.activeMasterKey = key.toUpperCase();
    const configKey = this.deriveConfigKey(this.activeMasterKey);
    // Add to history if not already there
    if (!this.keyHistory.find(h => h.key === this.activeMasterKey)) {
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
    })
    if (this.logs.length > 100) this.logs.pop()
  },

  logPacket(direction: 'TX' | 'RX', opcode: number, length: number, packet?: any) {
    const data: any = {};
    if (packet) {
      // Extract interesting fields from common packets
      if ('pinCode' in packet) data.pin = packet.pinCode;
      if ('configKey' in packet) data.key = packet.configKey;
      if ('weight' in packet) data.weight = `${packet.weight}g`;
      if ('battery' in packet) data.batt = `${packet.battery}%`;
      if ('isOpen' in packet) data.open = packet.isOpen;
      if ('date' in packet) data.time = packet.date.toLocaleTimeString();
    }

    this.packetLogs.unshift({
      time: new Date().toLocaleTimeString(),
      direction,
      opcode: `0x${opcode.toString(16).padStart(2, '0').toUpperCase()}`,
      name: this.getOpcodeName(opcode),
      length,
      data: Object.keys(data).length > 0 ? data : undefined
    });
    if (this.packetLogs.length > 50) this.packetLogs.pop();
  },

  async connect() {
    this.isConnecting = true;
    try {
      const logger = (level: string, event: string, context: any) => {
        if (event === 'send' || event === 'receive') {
          this.logPacket(
            event === 'send' ? 'TX' : 'RX', 
            context.opcode, 
            context.length || 0,
            (context as any).packet
          );
        }
      };

      if (this.useSimulator) {
        this.log('Initializing Simulator...', 'info')
        const sim = new BoksHardwareSimulator()
        sim.addPinCode('123456', BoksCodeType.Multi)
        this.simulator = sim

        const transport = new SimulatorTransport(sim)
        const client = new BoksClient({ transport, logger })
        this.controller = new BoksController(client)
        
        await this.controller.connect()
        this.deviceName = 'Boks Simulator'
      } else {
        this.log('Requesting Bluetooth device...', 'info')
        const client = new BoksClient({ logger })
        this.controller = new BoksController(client)
        await this.controller.connect()
        
        // Get the real BLE name if possible
        const bleName = (this.controller as any).client?.transport?.device?.name || 'Boks Device';
        this.deviceName = `${bleName} (${this.controller.hardwareInfo?.hardwareVersion || '?'})`;
        
        // Populate versions
        this.softwareVersion = this.controller.hardwareInfo?.softwareRevision || '';
        this.firmwareVersion = this.controller.hardwareInfo?.firmwareRevision || '';
        
        // Fetch initial status if possible (counts)
        this.controller.getBatteryLevel().then(l => this.batteryLevel = l || 0);
        this.controller.countCodes().then(c => {
          this.masterCodesCount = c.master;
          this.singleCodesCount = c.singleUse;
        });
      }

      this.isConnected = true;
      this.log('Global Connection Established!', 'success')
    } catch (err: any) {
      this.log(`Connection failed: ${err.message}`, 'error')
      throw err
    } finally {
      this.isConnecting = false;
    }
  },

  async disconnect() {
    if (this.controller) {
      await this.controller.disconnect()
      this.controller = null
      this.simulator = null
      this.isConnected = false
      this.deviceName = ''
      this.log('Disconnected.', 'info')
    }
  }
})
