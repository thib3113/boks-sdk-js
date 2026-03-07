# Gestion d'un code

Les appareils Boks vous permettent de gérer différents types de codes clavier pour ouvrir la porte, tels que les codes à usage unique (pour les livraisons) et les codes à usage multiple (pour les utilisateurs réguliers). Ces codes peuvent être générés et gérés directement depuis l'application à l'aide du `BoksController`.

## Génération de codes

Vous pouvez créer différents types de codes selon vos besoins. Lorsque vous créez un code, le SDK s'occupe de l'échange sécurisé avec l'appareil Boks.

```typescript
import { BoksController } from '@thib3113/boks-sdk';

// ... se connecter à l'appareil avec des identifiants administratifs (Clé de Config ou Clé Maître) ...

try {
  // 1. Créer un Code à Usage Unique (Code de livraison)
  // Ce code ne fonctionnera qu'une seule fois sur le clavier pour ouvrir la porte.
  const singleUseCode = '123456';
  await controller.createSingleUseCode(singleUseCode);
  console.log(`Code à usage unique ${singleUseCode} créé avec succès !`);

  // 2. Créer un Code à Usage Multiple (Code utilisateur récurrent)
  // Ce code peut être utilisé indéfiniment sur le clavier jusqu'à ce qu'il soit révoqué.
  const multiUseCode = '987654';
  await controller.createMultiUseCode(multiUseCode);
  console.log(`Code à usage multiple ${multiUseCode} créé avec succès !`);

  // 3. Créer un Code Maître
  // Un Code Maître est un code clavier permanent (généralement jusqu'à 4 peuvent exister, indexés de 0 à 3).
  // À ne pas confondre avec la Clé Maître cryptographique de 32 octets !
  // Les Codes Maîtres peuvent également être utilisés pour réinitialiser l'appareil directement depuis le clavier.
  const masterCodeIndex = 0; // Index de l'emplacement
  const masterCodePin = '000000';
  await controller.createMasterCode(masterCodeIndex, masterCodePin);
  console.log(`Code maître mis à jour à l'index ${masterCodeIndex} !`);

} catch (error) {
  console.error('Échec de la gestion des codes :', error);
}
```

## Ouvrir la porte via Bluetooth (Application)

Si l'utilisateur est à proximité avec son smartphone, vous n'avez pas besoin d'un code clavier. Vous pouvez déclencher une commande d'ouverture directement via Bluetooth. La fonction `openDoor` requiert un code PIN valide (qu'il soit à usage unique, multiple ou maître) pour authentifier la commande.

```typescript
try {
  // Tenter d'ouvrir la porte via Bluetooth en utilisant un code connu
  // Le code agit comme un jeton d'authentification pour la commande BLE
  const isOpened = await controller.openDoor('123456');

  if (isOpened) {
    console.log('Porte ouverte avec succès via Bluetooth !');
  } else {
    console.log('Échec de l\'ouverture de la porte. Code invalide ou problème avec l\'appareil.');
  }

} catch (error) {
  console.error('Erreur lors de la commande d\'ouverture :', error);
}
```
