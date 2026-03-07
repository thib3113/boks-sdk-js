# Gestion NFC

<BoksGlobalProvider />

Les appareils Boks équipés de la version matérielle 4.0 ou supérieure prennent en charge les tags NFC. Cela signifie que vous pouvez utiliser un badge ou un tag NFC pour ouvrir la boîte à colis au lieu d'un code sur le clavier ou d'une application mobile.

Le SDK vous permet de rechercher de nouveaux tags NFC, de les enregistrer et de gérer ceux qui existent déjà en utilisant le `BoksController`.

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
    // Vous pouvez également fournir un nom convivial pour le tag dans votre application
    await scanResult.register();

    console.log(`Tag ${scanResult.tagId} enregistré avec succès sur la Boks !`);
  } else {
    console.log('Aucun tag n\'a été scanné dans le délai imparti.');
  }
} catch (error) {
  console.error('Le scan ou l\'enregistrement NFC a échoué :', error);
}
```

## Lister et Gérer les Tags

Vous pouvez également lister tous les tags NFC actuellement enregistrés pour voir qui a accès. Cela vous permet de retirer des tags s'ils sont perdus.

```typescript
try {
  // Récupérer la liste des tags enregistrés
  console.log('Récupération des tags NFC enregistrés...');
  const tags = await controller.listNFCTags();

  if (tags.length === 0) {
    console.log('Aucun tag NFC n\'est encore enregistré.');
  } else {
    console.log(`${tags.length} tags enregistrés trouvés :`);

    tags.forEach((tag, index) => {
      console.log(`- Emplacement ${index + 1} : ${tag.tagId}`);
    });

    // Optionnellement, supprimer un tag (par exemple, le premier trouvé)
    const tagToDelete = tags[0];
    await tagToDelete.delete();
    console.log(`Le tag ${tagToDelete.tagId} a été retiré.`);
  }

} catch (error) {
  console.error('Échec de la gestion des tags NFC :', error);
}
```

<BoksPacketLogger />
