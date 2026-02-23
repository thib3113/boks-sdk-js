# Bugs & Particularités du Protocole (Quirks)

La rétro-ingénierie de matériel réel révèle souvent des comportements non documentés ou des bugs. Cette page recense les particularités connues du firmware Boks que les développeurs doivent prendre en compte.

## 1. Suppression des codes à usage unique (Opcode 0x0D)

Lors de l'envoi d'une commande pour supprimer un code à usage unique via Bluetooth (Opcode `0x0D`), le comportement du matériel est incohérent avec le reste du protocole.

- **La Particularité** : Même si le code est **correctement supprimé** de la mémoire interne de l'appareil, le firmware retourne une erreur `CODE_OPERATION_ERROR` (`0x78`) au lieu d'une notification de succès.

## 2. Encodage et Transmission de la ConfigKey

Le mécanisme d'authentification par **ConfigKey** utilise un format spécifique qui diffère des protocoles binaires standards.

- **Transmission ASCII** : Bien que la ConfigKey soit une représentation hexadécimale de 4 octets, elle est **toujours transmise sous la forme d'une chaîne ASCII de 8 caractères** dans la charge utile des paquets authentifiés. C'est moins efficace que l'envoi des 4 octets bruts, mais c'est une exigence stricte de l'analyseur (parser) du firmware.
- **Ordre des octets (Endianness)** : Le firmware attend que la chaîne hexadécimale de 8 caractères soit transmise en **hex ASCII Little Endian**, puis la réordonne en interne avant la comparaison.
- **Exemple** : Si votre clé est `AABBCCDD`, elle doit être envoyée sous la forme `DDCCBBAA` selon l'opcode et la version du firmware.

## 3. Volatilité de la Master Key (Masquage Flash)

Le matériel Boks ne stocke pas la **Master Key** complète de 32 octets dans sa mémoire flash à long terme.

- **La Particularité** : Lorsqu'une Master Key est fournie (via le provisioning ou la régénération), le matériel utilise la clé complète pour dériver le pool initial de codes. Cependant, avant de persister la clé dans le Flash Data Storage (FDS), il **met à zéro plusieurs octets** (généralement les 8 premiers octets).
- **Conséquence** : Cela signifie que le matériel ne peut pas "régénérer" son propre pool de codes à partir de son stockage interne s'ils sont perdus ; la clé complète doit être fournie à nouveau par le client pour toute opération de régénération.

## 4. Précision de l'âge dans l'historique

Le champ d'âge sur 3 octets dans les événements d'historique (flux `0x03`) est calculé par le firmware par rapport à son temps de fonctionnement interne (uptime).

- **La Particularité** : Si l'appareil redémarre, l'uptime est réinitialisé. L'âge rapporté pour les événements antérieurs au redémarrage peut être calculé de manière erronée si l'horloge RTC (Real Time Clock) n'a pas été synchronisée.
- **Conséquence** : La date absolue doit être calculée en soustrayant l'âge de l'heure locale actuelle au moment de la réception.

## 5. Génération de Codes Multi-Usages

Comme indiqué dans le [Guide du Protocole](./protocol), les versions de firmware strictement supérieures à **4.3.3** ont désactivé la génération de nouveaux codes Multi-Usages.

- **La Particularité** : Envoyer un `CREATE_MULTI_USE_CODE` (`0x13`) sur ces versions retournera une erreur, même si la charge utile et l'authentification sont correctes.
