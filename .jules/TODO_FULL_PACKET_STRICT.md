# Mission Jules : Passage au "Strict Full Packet"

## Contexte
Récemment, l'architecture du SDK a été migrée pour que toutes les méthodes `fromPayload` deviennent `fromRaw` et reçoivent un paquet Bluetooth complet (Opcode + Length + Payload + Checksum) plutôt que juste le payload de données.

Cependant, pour éviter de casser les ~1100 tests unitaires qui injectaient directement un payload partiel, un "fallback magique" a été ajouté dans la classe de base `src/protocol/_BoksPacketBase.ts` (méthode `extractPayloadData`). Ce fallback accepte de retourner un paquet partiel si la structure du paquet complet n'est pas reconnue.

**Problème architectural :** Le code de production s'adapte aux tests (Test-Induced Design Damage). Le contrat de `fromRaw` n'est pas strict.

## Objectif de la mission
Supprimer ce fallback en mettant à jour tous les tests pour qu'ils injectent des paquets stricts et complets, puis durcir la classe de base.

## Étapes à suivre par Jules :

### Étape 1 : Créer l'utilitaire de test
Créer un fichier utilitaire dans le dossier `tests/` (ex: `tests/utils/packet-builder.ts`) exportant une fonction `buildMockRawPacket(opcode: number, payloadData: Uint8Array, lengthIncludesHeader = false): Uint8Array`.
Cette fonction doit générer un tableau d'octets valide avec l'opcode, la longueur calculée, le payload inséré, et le checksum valide à la fin (en utilisant `calculateChecksum` de `src/utils/converters.ts`).

### Étape 2 : Mettre à jour les tests massivement
Rechercher dans tout le dossier `tests/` (y compris le fuzzing) les appels à `.fromRaw(payload)` et remplacer l'argument par un appel à la nouvelle fonction utilitaire.
Exemple : 
`AskDoorStatusPacket.fromRaw(new Uint8Array([1, 2]))` 
devient 
`AskDoorStatusPacket.fromRaw(buildMockRawPacket(AskDoorStatusPacket.opcode, new Uint8Array([1, 2])))`

*Attention aux tests de résilience/fuzzing (qui testent les erreurs de checksum), ceux-ci devront peut-être continuer à envoyer de la data malformée pour vérifier que ça "throw" bien.*

### Étape 3 : Durcir la classe de base (Strict Mode)
Une fois les tests mis à jour, modifier `src/protocol/_BoksPacketBase.ts`.
Dans la méthode statique `extractPayloadData`, supprimer la ligne finale `return data;` (le fameux fallback). 
À la place, si le paquet n'a pas la bonne taille, le bon opcode ou le bon checksum, la méthode doit throw une `BoksProtocolError` (ex: INVALID_CHECKSUM, INVALID_PAYLOAD_LENGTH, etc.).

### Étape 4 : Validation
Lancer `pnpm run test` et s'assurer que les 1100+ tests passent en mode strict.