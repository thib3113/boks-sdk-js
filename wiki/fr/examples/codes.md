# Gestion d'un code


Les appareils Boks vous permettent de gérer différents types de codes pour ouvrir la porte, tels que les codes à usage unique (pour les livraisons) et les codes à usage multiple (pour les utilisateurs réguliers). Ces codes peuvent être générés et gérés directement depuis l'application à l'aide du `BoksController`.

## Génération de codes

Vous pouvez créer différents types de codes selon vos besoins. Lorsque vous créez un code, le SDK s'occupe de l'échange sécurisé avec l'appareil Boks.

```typescript
import { BoksController } from '@thib3113/boks-sdk';

// ... se connecter à l'appareil avec les identifiants maîtres ...

try {
  // 1. Créer un Code à Usage Unique (Code de livraison)
  // Ce code ne fonctionnera qu'une seule fois pour ouvrir la porte.
  const singleUseCode = '123456';
  await controller.createSingleUseCode(singleUseCode);
  console.log(`Code à usage unique ${singleUseCode} créé avec succès !`);

  // 2. Créer un Code à Usage Multiple (Code utilisateur récurrent)
  // Ce code peut être utilisé indéfiniment jusqu'à ce qu'il soit révoqué.
  const multiUseCode = '987654';
  // Note : createMultiUseCode gère la vérification des emplacements disponibles et la configuration du code.
  await controller.createMultiUseCode(multiUseCode);
  console.log(`Code à usage multiple ${multiUseCode} créé avec succès !`);

  // 3. Définir un Code Maître
  // Le code maître est un code spécial qui permet également de réinitialiser les autres codes.
  const masterCode = '000000';
  await controller.setMasterCode(masterCode);
  console.log('Code maître mis à jour !');

} catch (error) {
  console.error('Échec de la gestion des codes :', error);
}
```

## Ouvrir la porte avec un code

Une fois qu'un code est défini (ou même avant, si vous utilisez des codes PIN calculés hors ligne), vous pouvez l'utiliser pour ouvrir la porte via Bluetooth.

```typescript
try {
  // Tenter d'ouvrir la porte en utilisant le code créé
  const isOpened = await controller.openDoor('123456');

  if (isOpened) {
    console.log('Porte ouverte avec succès !');
  } else {
    console.log('Échec de l\'ouverture de la porte. Code invalide ou problème avec l\'appareil.');
  }

} catch (error) {
  console.error('Erreur lors de la commande d\'ouverture :', error);
}
```
