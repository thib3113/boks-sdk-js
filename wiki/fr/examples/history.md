# Synchronisation de l'Historique

<BoksGlobalProvider />

L'appareil Boks maintient un journal interne des événements, y compris les ouvertures de porte, les utilisations de codes (valides/invalides), les événements système (allumage/extinction), et plus encore. Vous pouvez récupérer ces journaux en utilisant la méthode `fetchHistory()`.

## Démo Interactive

Utilisez l'outil ci-dessous pour vous connecter à un appareil Boks et consulter son journal d'historique.

<HistoryDemo />

## Utilisation

La méthode `fetchHistory()` retourne une Promise qui se résout en un tableau d'objets `BoksHistoryEvent`. Ces événements sont extraits directement du journal interne du matériel.

### Quelles données sont récupérées ?

Chaque `BoksHistoryEvent` contient des champs spécifiques qui vous aident à comprendre ce qui s'est passé :

- **`date`**: Un objet `Date` calculé représentant le moment où l'événement s'est produit. *Note : Étant donné que l'appareil Boks ne possède pas d'horloge absolue (RTC), la date est calculée à rebours en fonction de "l'âge" du journal au moment de la récupération.*
- **`opcode`**: L'identifiant exact `BoksOpcode` qui précise le type d'événement (par exemple, un code valide a été saisi, la porte a été physiquement ouverte).
- **`source`**: Pour les événements d'ouverture de porte, cela indique *comment* la porte a été ouverte (par exemple, `BoksOpenSource.Keypad`, `BoksOpenSource.PhysicalKey`, `BoksOpenSource.App`).
- **`rawData`**: La charge utile brute en octets provenant de l'appareil, utile pour le débogage ou un formatage avancé.

### Exemple de Code : Récupérer et Interpréter les Journaux

Voici un exemple détaillé montrant comment récupérer les journaux et interpréter les événements les plus courants :

```typescript
import { BoksController, BoksOpcode, BoksOpenSource } from '@thib3113/boks-sdk';

// ... se connecter à l'appareil ...

try {
  console.log('Récupération de l\'historique depuis l\'appareil Boks...');
  // Note : La récupération de l'historique nécessite des droits d'administration (Clé de Configuration ou Clé Maître)
  const history = await controller.fetchHistory();

  console.log(`${history.length} événements récupérés :`);

  history.forEach(event => {
    let description = 'Événement Inconnu';

    switch (event.opcode) {
      // 🚪 Événements Physiques de Porte
      case BoksOpcode.LOG_DOOR_OPEN:
        description = `Porte physiquement ouverte via ${getOpenSourceLabel(event.source)}`;
        break;
      case BoksOpcode.LOG_DOOR_CLOSE:
        description = 'Porte physiquement fermée';
        break;

      // ✅ Événements d'Accès Valide
      case BoksOpcode.LOG_CODE_BLE_VALID:
        description = 'Accès valide accordé via Bluetooth (App)';
        break;
      case BoksOpcode.LOG_CODE_KEYPAD_VALID:
        description = 'Code valide saisi sur le Clavier';
        break;
      case BoksOpcode.LOG_CODE_NFC_VALID:
        description = 'Accès valide accordé via Tag NFC';
        break;

      // ❌ Événements d'Accès Refusé
      case BoksOpcode.LOG_CODE_DENIED:
      case BoksOpcode.LOG_BLE_AUTH_FAILED:
        description = 'Accès refusé (Code invalide ou échec d\'authentification)';
        break;

      // ⚙️ Événements Système
      case BoksOpcode.LOG_WAKEUP_BUTTON:
        description = 'Appareil réveillé (Bouton pressé)';
        break;
      case BoksOpcode.LOG_WAKEUP_BLE:
        description = 'Appareil réveillé (Connexion Bluetooth)';
        break;
      default:
        description = `Autre événement (Opcode: 0x${event.opcode.toString(16).toUpperCase()})`;
    }

    console.log(`[${event.date.toLocaleString()}] ${description}`);
  });

} catch (error) {
  console.error('Échec de la synchronisation de l\'historique :', error);
}

// Fonction utilitaire pour traduire l'enum de la source en chaîne lisible
function getOpenSourceLabel(source?: BoksOpenSource): string {
  switch (source) {
    case BoksOpenSource.App: return 'Application Mobile (Bluetooth)';
    case BoksOpenSource.Keypad: return 'Code Clavier';
    case BoksOpenSource.Nfc: return 'Tag NFC';
    case BoksOpenSource.PhysicalKey: return 'Clé Physique de Secours';
    case BoksOpenSource.Button: return 'Bouton de Sortie Interne';
    default: return 'Source Inconnue';
  }
}
```

<BoksPacketLogger />
