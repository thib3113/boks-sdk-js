import DefaultTheme from 'vitepress/theme';
import BoksGlobalProvider from '../components/BoksGlobalProvider.vue';
import InitializationDemo from '../components/InitializationDemo.vue';
import OpenDoorDemo from '../components/OpenDoorDemo.vue';
import HistoryDemo from '../components/HistoryDemo.vue';
import BatteryDemo from '../components/BatteryDemo.vue';
import RegenerationDemo from '../components/RegenerationDemo.vue';
import BoksPacketLogger from '../components/BoksPacketLogger.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register global components
    app.component('BoksGlobalProvider', BoksGlobalProvider);
    app.component('InitializationDemo', InitializationDemo);
    app.component('OpenDoorDemo', OpenDoorDemo);
    app.component('HistoryDemo', HistoryDemo);
    app.component('BatteryDemo', BatteryDemo);
    app.component('RegenerationDemo', RegenerationDemo);
    app.component('BoksPacketLogger', BoksPacketLogger);
  }
};
