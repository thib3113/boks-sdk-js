# Synchronisation de l'Historique


L'appareil Boks maintient un journal interne des événements, y compris les ouvertures de porte, les utilisations de codes (valides/invalides), les événements système (allumage/extinction), et plus encore. Vous pouvez récupérer ces journaux en utilisant la méthode `fetchHistory()`.



## Utilisation

La méthode `fetchHistory()` retourne une Promise qui se résout en un tableau d'objets `BoksHistoryEvent`. Chaque événement contient :
- `date`: Un objet `Date` calculé représentant le moment où l'événement s'est produit (basé sur l'âge de l'événement).
- `opcode`: L'`BoksOpcode` identifiant le type d'événement.
- Des champs spécifiques en fonction du type d'événement (par exemple, la source de l'ouverture).

```typescript
import { BoksController, BoksOpcode } from '@thib3113/boks-sdk';

// ... se connecter à l'appareil ...

try {
  console.log('Récupération de l\'historique...');
  const history = await controller.fetchHistory();

  console.log(`${history.length} événements récupérés :`);

  history.forEach(event => {
    // Déterminer le type d'événement
    let description = 'Événement Inconnu';

    switch (event.opcode) {
      case BoksOpcode.LOG_DOOR_OPEN:
        description = 'Porte Ouverte';
        break;
      case BoksOpcode.LOG_CODE_BLE_VALID:
        description = 'Code Valide (App)';
        break;
      // ... gérer les autres opcodes
    }

    console.log(`[${event.date.toLocaleString()}] ${description}`);
  });

} catch (error) {
  console.error('Échec de la synchronisation de l\'historique :', error);
}
```
