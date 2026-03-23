import DefaultTheme from 'vitepress/theme';
import BoksGlobalProvider from '../components/BoksGlobalProvider.vue';
import InitializationDemo from '../components/InitializationDemo.vue';
import OpenDoorDemo from '../components/OpenDoorDemo.vue';
import HistoryDemo from '../components/HistoryDemo.vue';
import BatteryDemo from '../components/BatteryDemo.vue';
import RegenerationDemo from '../components/RegenerationDemo.vue';
import OfflinePinDemo from '../components/OfflinePinDemo.vue';
import BoksDashboard from '../components/BoksDashboard.vue';
import NfcDemo from '../components/NfcDemo.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    if (typeof window !== 'undefined') {
      const isFrench = navigator.language.startsWith('fr');
      const path = window.location.pathname;
      const base = import.meta.env.BASE_URL || '/';

      // Normalize paths for comparison (remove trailing slashes)
      const nPath = path.replace(/\/$/, '') || '/';
      const nBase = base.replace(/\/$/, '') || '/';

      console.log('[Redirection Debug]', { 
        lang: navigator.language, 
        isFrench, 
        path, 
        nPath, 
        base, 
        nBase,
        isAlreadyFr: path.includes('/fr/'),
        isRoot: nPath === nBase || nPath === nBase + '/index.html'
      });

      if (isFrench && !path.includes('/fr/')) {
        if (nPath === nBase || nPath === nBase + '/index.html') {
          const target = (nBase === '/' ? '' : nBase) + '/fr/';
          console.log(`[Redirection Debug] Redirecting to ${target}`);
          window.location.replace(target);
        }
      }
    }

    // Register global components
    app.component('BoksGlobalProvider', BoksGlobalProvider);
    app.component('InitializationDemo', InitializationDemo);
    app.component('OpenDoorDemo', OpenDoorDemo);
    app.component('HistoryDemo', HistoryDemo);
    app.component('BatteryDemo', BatteryDemo);
    app.component('RegenerationDemo', RegenerationDemo);
    app.component('OfflinePinDemo', OfflinePinDemo);
    app.component('BoksDashboard', BoksDashboard);
    app.component('NfcDemo', NfcDemo);
  }
};
