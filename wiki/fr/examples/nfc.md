# Gestion NFC


Les appareils Boks équipés de la version matérielle 4.0 ou supérieure prennent en charge les tags NFC. Cela signifie que vous pouvez utiliser un badge ou un tag NFC pour ouvrir la boîte à colis au lieu d'un code sur le clavier ou d'une application mobile.

Le SDK vous permet de rechercher de nouveaux tags NFC, de les enregistrer et de les gérer en utilisant le `BoksController`.

## Recherche et Enregistrement de Tags

Pour enregistrer un nouveau tag NFC, vous devez d'abord mettre la Boks en état de scan. Une fois qu'un tag est approché, l'appareil signalera son ID, et vous pourrez alors l'enregistrer.

```typescript
import { BoksController } from '@thib3113/boks-sdk';

// ... se connecter à l'appareil avec les identifiants maîtres ...

try {
  // 1. Scanner pour trouver un nouveau Tag NFC
  console.log('Placez un tag NFC près du lecteur Boks...');

  // Cette fonction attendra jusqu'à ce qu'un tag soit détecté ou qu'un délai d'attente se produise
  const scanResult = await controller.scanNFCTags();

  if (scanResult) {
    console.log(`Tag trouvé ! ID : ${scanResult.tagId}`);

    // 2. Enregistrer le tag scanné
    await scanResult.register();
    // Ou vous pouvez le faire directement avec :
    // await controller.registerNFCTag(scanResult.tagId);

    console.log(`Tag ${scanResult.tagId} enregistré avec succès sur la Boks !`);
  } else {
    console.log('Aucun tag n\'a été scanné dans le délai imparti.');
  }
} catch (error) {
  console.error('Le scan ou l\'enregistrement NFC a échoué :', error);
}
```

## Désenregistrement de Tags

Si un tag NFC est perdu ou n'a plus besoin d'accéder, vous pouvez le désenregistrer en utilisant son UID. Vous devez connaître l'UID du tag pour le supprimer, car l'appareil ne fournit pas de commande pour lister tous les tags enregistrés.

```typescript
try {
  const tagToRemove = '04:A1:B2:C3:D4:E5:F6'; // L'UID connu du tag

  // Supprimer le tag de l'appareil Boks
  console.log(`Désenregistrement du tag NFC : ${tagToRemove}`);
  await controller.unregisterNFCTag(tagToRemove);

  console.log(`Le tag ${tagToRemove} a été supprimé avec succès.`);

} catch (error) {
  console.error('Échec du désenregistrement du tag NFC :', error);
}
```
