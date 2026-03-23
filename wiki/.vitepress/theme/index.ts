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
      console.log('[Redirection Debug]', { lang: navigator.language, isFrench, path });
      
      // If we are at the root (considering base path if any), redirect to /fr/
      // On GH Pages, path might be "/boks-sdk-js/" instead of "/"
      if (isFrench && (path === '/' || path === '/index.html')) {
        console.log('[Redirection Debug] Redirecting to /fr/');
        window.location.replace('/fr/');
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
