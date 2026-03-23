# Gestion d'un code

Les appareils Boks vous permettent de gérer différents types de codes clavier pour ouvrir la porte, tels que les codes à usage unique (pour les livraisons) et les codes à usage multiple (pour les utilisateurs réguliers). Ces codes peuvent être générés et gérés directement depuis l'application à l'aide du `BoksController`.

## Flux de travail complet : Code Maître

Voici un exemple complet illustrant l'ensemble du cycle de vie d'un code : la création d'un code maître, son utilisation pour ouvrir la porte via Bluetooth, l'attente de l'ouverture et de la fermeture physique de la porte, la récupération de l'historique pour confirmer l'événement, et enfin la suppression du code.

```typescript
import { BoksController, BoksOpcode } from '@thib3113/boks-sdk';

// ... se connecter à l'appareil avec des identifiants administratifs (Clé de Config ou Clé Maître) ...

try {
  const masterCodeIndex = 0; // Index de l'emplacement (0-255)
  const masterCodePin = '000000';

  // 1. Créer un Code Maître
  // Un Code Maître est un code clavier permanent.
  // Ne le confondez pas avec la Clé Maître cryptographique de 32 octets !
  console.log('1. Création du Code Maître...');
  await controller.createMasterCode(masterCodeIndex, masterCodePin);
  console.log(`✅ Code maître créé à l'index ${masterCodeIndex} !`);

  // 2. Ouvrir la Porte via Bluetooth
  // Le code agit comme un jeton d'authentification pour la commande BLE
  console.log('2. Ouverture de la porte via Bluetooth...');
  const isOpened = await controller.openDoor(masterCodePin);

  if (isOpened) {
    console.log('✅ Porte déverrouillée avec succès !');
  }

  // --- 🧍 Interaction de l'utilisateur ---
  // À ce stade, l'utilisateur ouvre physiquement la porte, y place un colis,
  // puis repousse la porte pour la fermer.
  console.log('   (En attente que l\'utilisateur ouvre et ferme physiquement la porte...)');
  // -------------------------

  // 3. Récupérer l'historique pour vérifier l'événement
  console.log('3. Récupération des journaux d\'historique...');
  const history = await controller.fetchHistory();

  // Trouver le dernier événement réussi d'ouverture via BLE
  const lastBleOpen = history.find(e => e.opcode === BoksOpcode.LOG_CODE_BLE_VALID);

  if (lastBleOpen) {
    console.log(`✅ Vérifié ! La porte a été ouverte via l'App à : ${lastBleOpen.date.toLocaleString()}`);
  }

  // 4. Nettoyage : Supprimer le code
  console.log('4. Suppression du Code Maître...');
  await controller.deleteMasterCode(masterCodeIndex);
  console.log(`✅ Code maître à l'index ${masterCodeIndex} supprimé.`);

} catch (error) {
  console.error('Échec dans le flux de travail :', error);
}
```

## Générer d'autres codes

Vous pouvez également créer d'autres types de codes en fonction de vos besoins :

```typescript
try {
  // Créer un Code à Usage Unique (Code de livraison ponctuel)
  // Ce code ne fonctionnera qu'une seule fois sur le clavier pour ouvrir la porte.
  const singleUseCode = '123456';
  await controller.createSingleUseCode(singleUseCode);

  // Créer un Code à Usage Multiple (Code utilisateur récurrent)
  // Ce code peut être utilisé indéfiniment sur le clavier jusqu'à ce qu'il soit révoqué.
  const multiUseCode = '987654';
  await controller.createMultiUseCode(multiUseCode);

  // Supprimer un code à Usage Multiple
  await controller.deleteMultiUseCode(multiUseCode);

} catch (error) {
  console.error('Échec de la gestion des codes :', error);
}
```
