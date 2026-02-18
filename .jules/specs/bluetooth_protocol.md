# Protocole Bluetooth (Opcodes & Paquets)
Date de modification : Mardi 17 Février 2026

Ce document constitue la référence officielle du protocole de communication Bluetooth Low Energy (BLE) entre l'application Boks et le boîtier. Il détaille la structure des paquets et l'intégralité des opcodes connus.

Pour une vue d'ensemble de l'architecture logicielle et des services de l'application, voir Analyse de la Communication.

## Identifiants (UUIDs)

- **Service d'advertising (DFU/Discovery) :** `FE59`
- **Service principal Boks :** `A7630001-F491-4F21-95EA-846BA586E361`
- **Caractéristique d'écriture (downlink) :** `A7630002-F491-4F21-95EA-846BA586E361`
- **Caractéristique de notification (uplink) :** `A7630003-F491-4F21-95EA-846BA586E361`

## Structure Générale des Paquets

### Checksum (Somme de contrôle)
- **Calcul :** `(Opcode + Length + Somme(Octets du Payload)) & 0xFF`.
- **Uplink (Boks -> App) :** L'octet **Length** est systématiquement inclus dans le calcul produit par le firmware.
- **Downlink (App -> Boks) :** Bien que le firmware ignore souvent la vérification en réception, il est requis par le protocole pour garantir la compatibilité.

### Commandes (Downlink)
`[Opcode, Length, Payload..., Checksum]`
- **Checksum :** `(Opcode + Length + Sum(Payload)) & 0xFF`. Note: Le firmware actuel ignore la vérification en réception mais produit ce format en émission.

### Notifications (Uplink)
`[Opcode, Length, Payload..., Checksum]`
- **Checksum :** `(Opcode + Length + Sum(Payload)) & 0xFF`.

### Événements d'Historique (Uplink - Réponse à `REQUEST_LOGS`)
Structure : `[Opcode, Length, Payload..., Checksum]`

- **Opcode :** L'identifiant de l'événement (ex: `0x86`).
- **Length :** Longueur de la charge utile (Payload).
- **Payload :** Contient généralement l'âge de l'événement suivi de données spécifiques.
  - **Age (3 octets, Big Endian) :** Temps écoulé en **secondes** depuis l'événement.
    - Calcul : `Event_Timestamp = Current_Time - Age`.
- **Checksum :** Somme de contrôle incluant Opcode et Length.

## Commandes (Downlink)

### `OPEN_DOOR` (Opcode: `0x01`)
- **Structure du Paquet :** `[Opcode, Length, Code_ASCII..., Checksum]`
- **Analyse détaillée :**
  - `01` (`Opcode`): Identifiant de la commande d'ouverture.
  - `LL` (`Length`): Longueur du code ASCII.
  - `...` (`Code`): Le code d'ouverture (ex: "123456") en format ASCII.
  - `CS` (`Checksum`): Somme de contrôle (généralement somme Opcode + Payload).

### `ASK_DOOR_STATUS` (Opcode: `0x02`)
- **Structure du Paquet :** `[0x02, 0x00]`
- **Analyse détaillée :**
  - `02` (`Opcode`): Demande le statut de la porte.
  - `00` (`Length`): Aucune charge utile.

### `REQUEST_LOGS` (Opcode: `0x03`)
- **Structure du Paquet :** `[0x03, 0x00, 0x03]`
- **Analyse détaillée :**
  - `03` (`Opcode`): Demande le transfert de l'historique.
  - `00` (`Length`): Aucune charge utile.
  - `03` (`Checksum`): Somme de contrôle (0x03 + 0x00).

### `REBOOT` (Opcode: `0x06`)
- **Structure du Paquet :** `[0x06, 0x00]`
- **Analyse détaillée :**
  - `06` (`Opcode`): Provoque un redémarrage logiciel.
  - `00` (`Length`): Aucune charge utile.

### `GET_LOGS_COUNT` (Opcode: `0x07`)
- **Structure du Paquet :** `[0x07, 0x00]`
- **Analyse détaillée :**
  - `07` (`Opcode`): Demande le nombre de logs.
  - `00` (`Length`): Aucune charge utile.

### `TEST_BATTERY` (Opcode: `0x08`)
- **Structure du Paquet :** `[0x08, 0x00]`
- **Analyse détaillée :**
  - `08` (`Opcode`): Déclenche un test de batterie.
  - `00` (`Length`): Aucune charge utile.

### `MASTER_CODE_EDIT` (Opcode: `0x09`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 0 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Code_ID, New_Code(6 bytes), Checksum]`
- **Analyse détaillée :**
  - `09` (`Opcode`): Édite un code maître.
  - `LL` (`Length`): Longueur totale du payload (8 + 1 + 6).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `ID` (`Code_ID`): Identifiant du code à modifier (1 octet).
  - `...` (`New_Code`): Le nouveau code en ASCII (6 octets).
  - `CS` (`Checksum`): Somme de contrôle.

### `SINGLE_USE_CODE_TO_MULTI` (Opcode: `0x0A`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 1 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Code_Value(6 bytes), Checksum]`
- **Analyse détaillée :**
  - `0A` (`Opcode`): Convertit Usage Unique -> Multi.
  - `LL` (`Length`): Longueur totale du payload (8 + 6).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `...` (`Code_Value`): La valeur du code cible en ASCII (6 octets).
  - `CS` (`Checksum`): Somme de contrôle.

### `MULTI_CODE_TO_SINGLE_USE` (Opcode: `0x0B`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 2 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Code_Value(6 bytes), Checksum]`
- **Analyse détaillée :**
  - `0B` (`Opcode`): Convertit Multi -> Usage Unique.
  - `LL` (`Length`): Longueur totale du payload (8 + 6).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `...` (`Code_Value`): La valeur du code cible en ASCII (6 octets).
  - `CS` (`Checksum`): Somme de contrôle.

### `DELETE_MASTER_CODE` (Opcode: `0x0C`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 3 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Code_ID, Checksum]`
- **Analyse détaillée :**
  - `0C` (`Opcode`): Supprime un code maître.
  - `09` (`Length`): 8 (Key) + 1 (ID) = 9 octets.
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `ID` (`Code_ID`): Identifiant du code à supprimer (Index).
  - `CS` (`Checksum`): Somme de contrôle.

### `DELETE_SINGLE_USE_CODE` (Opcode: `0x0D`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 4 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Code_Value(6 bytes), Checksum]`
- **Analyse détaillée :**
  - `0D` (`Opcode`): Supprime un code à usage unique.
  - `LL` (`Length`): Longueur totale du payload (8 + 6).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `...` (`Code_Value`): Le code à supprimer (pour identification, 6 octets).
  - `CS` (`Checksum`): Somme de contrôle.

### `DELETE_MULTI_USE_CODE` (Opcode: `0x0E`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 5 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Code_Value(6 bytes), Checksum]`
- **Analyse détaillée :**
  - `0E` (`Opcode`): Supprime un code multi-usage.
  - `LL` (`Length`): Longueur totale du payload (8 + 6).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `...` (`Code_Value`): Le code à supprimer (6 octets).
  - `CS` (`Checksum`): Somme de contrôle.

### `REACTIVATE_CODE` (Opcode: `0x0F`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 6 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Code_Value(6 bytes), Checksum]`
- **Analyse détaillée :**
  - `0F` (`Opcode`): Réactive un code désactivé.
  - `LL` (`Length`): Longueur totale du payload (8 + 6).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `...` (`Code_Value`): Le code à réactiver (6 octets).
  - `CS` (`Checksum`): Somme de contrôle.

### `GENERATE_CODES` (Opcode: `0x10`)
> ℹ️ **Note :** Bien que dans la plage protégée, cette commande **NE vérifie PAS** la clé (Bit 7 du masque à 0).
- **Structure du Paquet :** `[Opcode, Length, Seed (32 octets), Checksum]`
- **Analyse détaillée :**
  - `10` (`Opcode`): Lance la génération de codes.
  - `20` (`Length`): 32 octets (0x20).
  - `...` (`Seed`): 32 octets d'entropie (hex) pour initialiser le générateur.
  - `CS` (`Checksum`): Somme de contrôle.

### `CREATE_MASTER_CODE` (Opcode: `0x11`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 8 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, New_Code(6 bytes), Code_ID(1 byte), Checksum]`
- **Analyse détaillée :**
  - `11` (`Opcode`): Crée un nouveau code maître.
  - `LL` (`Length`): 8 (Key) + 6 (Code) + 1 (Index) = 15 octets.
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `...` (`New_Code`): Le nouveau code en ASCII (6 octets).
  - `ID` (`Code_ID`): L'index du code maître (0-99).
  - `CS` (`Checksum`): Somme de contrôle.

### `CREATE_SINGLE_USE_CODE` (Opcode: `0x12`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 9 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, New_Code(6 bytes), Checksum]`
- **Analyse détaillée :**
  - `12` (`Opcode`): Crée un code à usage unique.
  - `LL` (`Length`): 8 (Key) + 6 (Code).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `...` (`New_Code`): Le nouveau code en ASCII (6 octets).
  - `CS` (`Checksum`): Somme de contrôle.

### `CREATE_MULTI_USE_CODE` (Opcode: `0x13`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 10 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, New_Code(6 bytes), Checksum]`
- **Analyse détaillée :**
  - `13` (`Opcode`): Crée un code multi-usage.
  - `LL` (`Length`): 8 (Key) + 6 (Code).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `...` (`New_Code`): Le nouveau code en ASCII (6 octets).
  - `CS` (`Checksum`): Somme de contrôle.

### `COUNT_CODES` (Opcode: `0x14`)
> ℹ️ **Note :** Bien que dans la plage protégée, cette commande **NE vérifie PAS** la clé (Bit 11 du masque à 0).
- **Structure du Paquet :** `[0x14, 0x00, 0x14]`
- **Analyse détaillée :**
  - `14` (`Opcode`): Demande le nombre de codes actifs.
  - `00` (`Length`): Aucune charge utile.
  - `14` (`Checksum`): Somme de contrôle (0x14 + 0x00).

### `GENERATE_CODES_SUPPORT` (Opcode: `0x15`)
> ℹ️ **Note :** Bien que dans la plage protégée, cette commande **NE vérifie PAS** la clé (Bit 12 du masque à 0).
- **Structure du Paquet :** `[Opcode, Length, Seed (32 octets), Checksum]`
- **Analyse détaillée :**
  - `15` (`Opcode`): Génère des codes de support.
  - `20` (`Length`): 32 octets (0x20).
  - `...` (`Seed`): 32 octets d'entropie pour le générateur.
  - `CS` (`Checksum`): Somme de contrôle.


### `SET_CONFIGURATION` (Opcode: `0x16`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 13 du masque activé).
- **Exemple 1 (Activer Scan La Poste):**
  - **Hex:** `160a[8_octets_ConfigKey]010118`
  - **Source:** Code JavaScript de l'application (Analysé).
  - **Structure d'envoi :** `[Opcode, Longueur_Payload, ...ConfigKey_ASCII, R, P, Checksum]`
  - **Analyse détaillée :**
    *   `16` (`SET_CONFIGURATION`): L'opcode pour définir la configuration.
    *   `0a` (`Length`): 10 octets (8 Clé + 1 Type + 1 Valeur).
    *   `[8 octets]` (`ConfigKey`): 8 octets de la `configurationKey` en ASCII.
    *   `01` (`R`): Type de configuration = `SCAN_LAPOSTE_NFC_TAGS` (0x01).
    *   `01` (`P`): Valeur = Activé (0x01).
    *   `18` (`Checksum`): 0x16 + 0x01 + 0x01 = 0x18.
  - **Interprétation :** Cette commande active la fonctionnalité de scan des badges Vigik La Poste. `R=0x01` cible cette fonctionnalité spécifique. `P=0x01` l'active (mettre `P=0x00` pour désactiver, Checksum deviendrait `0x17`).

### `REGISTER_NFC_TAG_SCAN_START` (Opcode: `0x17`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 14 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Checksum]`
- **Analyse détaillée :**
  - `17` (`Opcode`): Démarre le scan d'enregistrement NFC.
  - `08` (`Length`): 8 octets (Key).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `CS` (`Checksum`): Somme de contrôle.

### `REGISTER_NFC_TAG` (Opcode: `0x18`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 15 du masque activé).
- **Structure du Paquet :** `[Opcode, TotalLength, configurationKey, UID_Length, Tag_UID..., Checksum]`
- **Analyse détaillée :**
  - `18` (`Opcode`): Enregistre un Tag NFC.
  - `LL` (`TotalLength`): Longueur totale du payload (8 + 1 + UIDLen).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `L` (`UID_Length`): Longueur de l'UID (1 octet).
  - `...` (`Tag_UID`): L'identifiant unique du badge (binaire brut).
  - `CS` (`Checksum`): Somme de contrôle.

### `UNREGISTER_NFC_TAG` (Opcode: `0x19`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 16 du masque activé).
- **Structure du Paquet :** `[Opcode, TotalLength, configurationKey, UID_Length, Tag_UID..., Checksum]`
- **Analyse détaillée :**
  - `19` (`Opcode`): Supprime un Tag NFC.
  - `LL` (`TotalLength`): Longueur totale du payload (8 + 1 + UIDLen).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `L` (`UID_Length`): Longueur de l'UID (1 octet).
  - `...` (`Tag_UID`): L'identifiant unique du badge à supprimer.
  - `CS` (`Checksum`): Somme de contrôle.

### `RE_GENERATE_CODES_PART1` (Opcode: `0x20`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 23 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Secret_Part_A, Checksum]`
- **Analyse détaillée :**
  - `20` (`Opcode`): Première étape de régénération.
  - `18` (`Length`): 24 octets (8 Key + 16 Secret).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `PART_A` (`Secret_Part_A`): Les 16 premiers octets du nouveau secret.
  - `CS` (`Checksum`): Somme de contrôle.

### `RE_GENERATE_CODES_PART2` (Opcode: `0x21`)
> 🔒 **Sécurité :** Cette commande nécessite la `configurationKey` (Bit 24 du masque activé).
- **Structure du Paquet :** `[Opcode, Length, configurationKey, Secret_Part_B, Checksum]`
- **Analyse détaillée :**
  - `21` (`Opcode`): Seconde étape et finalisation.
  - `18` (`Length`): 24 octets (8 Key + 16 Secret).
  - `KEY` (`configurationKey`): 8 octets ASCII de la configurationKey.
  - `PART_B` (`Secret_Part_B`): Les 16 derniers octets du nouveau secret.
  - `CS` (`Checksum`): Somme de contrôle.

### `SCALE_BOND` (Opcode: `0x50`)
- **Exemple 1:**
  - **Hex:** `50[DATA]`
  - **Analyse:** Demande l'appairage avec la balance.

### `SCALE_GET_MAC_ADDRESS_BOKS` (Opcode: `0x52`)
- **Exemple 1:**
  - **Hex:** `5200`
  - **Analyse:** Demande l'adresse MAC de la balance Boks.

### `SCALE_FORGET_BONDING` (Opcode: `0x53`)
- **Exemple 1:**
  - **Hex:** `5300`
  - **Analyse:** Oublie l'appairage avec la balance.

### `SCALE_TARE_EMPTY` (Opcode: `0x55`)
- **Exemple 1:**
  - **Hex:** `5500`
  - **Analyse:** Effectue la tare de la balance à vide.

### `SCALE_TARE_LOADED` (Opcode: `0x56`)
- **Exemple 1:**
  - **Hex:** `56[DATA]`
  - **Analyse:** Effectue la tare de la balance avec une charge.

### `SCALE_MEASURE_WEIGHT` (Opcode: `0x57`)
- **Exemple 1:**
  - **Hex:** `5700`
  - **Analyse:** Demande la mesure du poids par la balance.

### `SCALE_PREPARE_DFU` (Opcode: `0x60`)
- **Exemple 1:**
  - **Hex:** `6000`
  - **Analyse:** Prépare la balance pour une mise à jour DFU.

### `SCALE_GET_RAW_SENSORS` (Opcode: `0x61`)
- **Exemple 1:**
  - **Hex:** `6100`
  - **Analyse:** Demande les données brutes des capteurs de la balance.

### `SCALE_RECONNECT` (Opcode: `0x62`)
- **Exemple 1:**
  - **Hex:** `6200`
  - **Analyse:** Demande la reconnexion à la balance.
  
## Notifications (Uplink)

### `CODE_OPERATION_SUCCESS` (Opcode: `0x77`)
- **Exemple 1:**
  - **Hex:** `770077`
  - **Analyse:** Confirme le succès d'une opération sur un code.

### `CODE_OPERATION_ERROR` (Opcode: `0x78`)
- **Exemple 1:**
  - **Hex:** `78[DATA]`
  - **Analyse:** Indique une erreur lors d'une opération sur un code.

### `NOTIFY_LOGS_COUNT` (Opcode: `0x79`)
- **Description:** Réponse à la commande `GET_LOGS_COUNT` (0x07). Notifie le nombre de logs disponibles dans le dispositif.
- **Structure du Payload:**
  - **2 octets:** Nombre de logs (uint16, Big Endian)
- **Exemple 1:**
  - **Hex:** `7902001792`
  - **Analyse:**
    - `79`: Opcode
    - `02`: Longueur du payload (2 octets)
    - `0017`: Nombre de logs = 23 (0x0017 en Big Endian)
    - `92`: Checksum
- **Exemple 2 (Analyse détaillée):**
  - **Hex:** `790200007b`
  - **Analyse:**
    - `79`: Opcode
    - `02`: Longueur du payload (2 octets)
    - `0000`: Nombre de logs = 0 (0x0000 en Big Endian)
    - `7b`: Checksum

### `ERROR_COMMAND_NOT_SUPPORTED` (Opcode: `0x80`)
- **Exemple 1:**
  - **Hex:** `80[DATA]`
  - **Analyse:** Commande reçue non supportée par le firmware.

### `VALID_OPEN_CODE` (Opcode: `0x81`)
- **Exemple 1:**
  - **Hex:** `810081`
  - **Analyse:** Confirme que le code d'ouverture est valide.

### `INVALID_OPEN_CODE` (Opcode: `0x82`)
- **Exemple 1:**
  - **Hex:** `820082`
  - **Analyse:** Indique que le code d'ouverture est invalide.

### `NOTIFY_DOOR_STATUS` (Opcode: `0x84`)
- **Structure du Payload :** `[Inverted, Raw]` (2 octets)
- **Logique :** La porte est considérée ouverte si `Raw == 0x01` et `Inverted == 0x00`. Elle est fermée si `Raw == 0x00` et `Inverted == 0x01`.
- **Exemple (Fermé) :**
  - **Hex:** `8402010087`
  - **Analyse :** `0x84` (Opcode), `0x02` (Len), `0x01` (Inverted=1), `0x00` (Raw=0), `0x87` (CS).
- **Exemple (Ouvert) :**
  - **Hex:** `8402000187`
  - **Analyse :** `0x84` (Opcode), `0x02` (Len), `0x00` (Inverted=0), `0x01` (Raw=1), `0x87` (CS).

### `ANSWER_DOOR_STATUS` (Opcode: `0x85`)
- **Structure du Payload :** Identique à `0x84`.
- **Exemple (Fermé) :**
  - **Hex:** `8502010088`
  - **Analyse :** `0x85` (Opcode), `0x02` (Len), `0x01` (Inverted=1), `0x00` (Raw=0), `0x88` (CS).

### `NOTIFY_SCALE_BONDING_SUCCESS` (Opcode: `0xB0`)
- **Exemple 1:**
  - **Hex:** `B000`
  - **Analyse:** Notification du succès de l'appairage de la balance.

### `NOTIFY_SCALE_BONDING_ERROR` (Opcode: `0xB1`)
- **Exemple 1:**
  - **Hex:** `B1[DATA]`
  - **Analyse:** Notification d'une erreur lors de l'appairage de la balance.

### `NOTIFY_MAC_ADDRESS_BOKS_SCALE` (Opcode: `0xB2`)
- **Exemple 1:**
  - **Hex:** `B2[MAC_ADDR]`
  - **Analyse:** Notification de l'adresse MAC de la balance Boks.

### `NOTIFY_SCALE_BONDING_FORGET_SUCCESS` (Opcode: `0xB3`)
- **Exemple 1:**
  - **Hex:** `B300`
  - **Analyse:** Notification du succès de l'oubli d'appairage de la balance.

### `NOTIFY_SCALE_BONDING_PROGRESS` (Opcode: `0xB4`)
- **Exemple 1:**
  - **Hex:** `B4[DATA]`
  - **Analyse:** Notification de la progression de l'appairage de la balance.

### `NOTIFY_SCALE_TARE_EMPTY_OK` (Opcode: `0xB5`)
- **Exemple 1:**
  - **Hex:** `B500`
  - **Analyse:** Notification de la réussite de la tare à vide de la balance.

### `NOTIFY_SCALE_TARE_LOADED_OK` (Opcode: `0xB6`)
- **Exemple 1:**
  - **Hex:** `B600`
  - **Analyse:** Notification de la réussite de la tare avec charge de la balance.

### `NOTIFY_SCALE_MEASURE_WEIGHT` (Opcode: `0xB7`)
- **Exemple 1:**
  - **Hex:** `B7[DATA]`
  - **Analyse:** Notification de la mesure du poids par la balance.

### `NOTIFY_SCALE_DISCONNECTED` (Opcode: `0xB8`)
- **Exemple 1:**
  - **Hex:** `B800`
  - **Analyse:** Notification de la déconnexion de la balance.

### `NOTIFY_SCALE_RAW_SENSORS` (Opcode: `0xB9`)
- **Exemple 1:**
  - **Hex:** `B9[DATA]`
  - **Analyse:** Notification des données brutes des capteurs de la balance.

### `NOTIFY_SCALE_FAULTY` (Opcode: `0xBA`)
- **Exemple 1:**
  - **Hex:** `BA[DATA]`
  - **Analyse:** Notification d'un état défectueux de la balance.

### `NOTIFY_CODE_GENERATION_SUCCESS` (Opcode: `0xC0`)
- **Exemple 1:**
  - **Hex:** `c000c0`
  - **Analyse:** Notifie que la génération de code a réussi.

### `NOTIFY_CODE_GENERATION_ERROR` (Opcode: `0xC1`)
- **Exemple 1:**
  - **Hex:** `c100c1`
  - **Analyse:** Notifie une erreur lors de la génération de code.

### `NOTIFY_CODE_GENERATION_PROGRESS` (Opcode: `0xC2`)
- **Exemple 1:**
  - **Hex:** `c20100c3`
  - **Analyse:** Notifie la progression de la génération de code.

### `NOTIFY_CODES_COUNT` (Opcode: `0xC3`)
- **Description:** Notifie le nombre de codes maîtres et de codes à usage unique/multi (ou compteur de génération).
- **Structure du Paquet:** `[0xC3, TotalLength, MasterCount(2), OtherCount(2), Checksum]`
- **Analyse détaillée:**
  - `c3` (`Opcode`): Notification du nombre de codes.
  - `07` (`TotalLength`): Longueur totale du paquet (7 octets).
  - `MMMM` (`MasterCount`): Nombre de codes maîtres (uint16, Big Endian).
  - `OOOO` (`OtherCount`): Nombre de codes à usage unique/multi (uint16, Big Endian). Souvent utilisé pour le compteur de codes dynamiques.
  - `CS` (`Checksum`): Somme de contrôle.
- **Exemple 1 (Log réel):**
  - **Hex:** `c30700020cfdd5`
  - **Analyse:**
    - `c3`: Opcode
    - `07`: Longueur totale
    - `0002`: Master = 2
    - `0cfd`: SingleUse = 3325 (0x0CFD)
    - `d5`: Checksum (0xC3 + 0x07 + 0x00 + 0x02 + 0x0C + 0xFD = 0x1D5 -> 0xD5)
- **Exemple 2:**
  - **Hex:** `c30700090000d3`
  - **Analyse:** Master = 9, SingleUse = 0. Checksum = 0xD3.

### `NOTIFY_SET_CONFIGURATION_SUCCESS` (Opcode: `0xC4`)
- **Exemple 1:**
  - **Hex:** `c400c4`
  - **Analyse:** Notifie que la configuration a été appliquée avec succès.

### `NOTIFY_NFC_TAG_REGISTER_SCAN_RESULT` (Opcode: `0xC5`)
- **Exemple 1:**
  - **Hex:** `C5[DATA]`
  - **Analyse:** Résultat du scan pour l'enregistrement d'un tag NFC.

### `NOTIFY_NFC_TAG_REGISTER_SCAN_ERROR_ALREADY_EXISTS` (Opcode: `0xC6`)
- **Exemple 1:**
  - **Hex:** `C6[DATA]`
  - **Analyse:** Erreur de scan NFC : tag déjà enregistré.

### `NOTIFY_NFC_TAG_REGISTER_SCAN_TIMEOUT` (Opcode: `0xC7`)
- **Exemple 1:**
  - **Hex:** `C700`
  - **Analyse:** Timeout lors du scan NFC.

### `NOTIFY_NFC_TAG_REGISTERED_SUCCESS` (Opcode: `0xC8`)
- **Exemple 1:**
  - **Hex:** `C800`
  - **Analyse:** Tag NFC enregistré avec succès.

### `NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS` (Opcode: `0xC9`)
- **Exemple 1:**
  - **Hex:** `C9[DATA]`
  - **Analyse:** Erreur d'enregistrement NFC : tag déjà existant.

### `NOTIFY_NFC_TAG_UNREGISTERED_SUCCESS` (Opcode: `0xCA`)
- **Exemple 1:**
  - **Hex:** `CA00`
  - **Analyse:** Tag NFC désenregistré avec succès.

### `ERROR_CRC` (Opcode: `0xE0`)
- **Exemple 1:**
  - **Hex:** `E0[DATA]`
  - **Analyse:** Erreur de contrôle CRC.

### `ERROR_UNAUTHORIZED` (Opcode: `0xE1`)
- **Exemple 1:**
  - **Hex:** `E1[DATA]`
  - **Analyse:** Erreur : action non autorisée.

### `ERROR_BAD_REQUEST` (Opcode: `0xE2`)
- **Exemple 1:**
  - **Hex:** `E2[DATA]`
  - **Analyse:** Erreur : mauvaise requête.

## Événements d'Historique (Uplink)

### `CODE_BLE_VALID_HISTORY` (Opcode: `0x86`)
- **Structure du Paquet :** `[Opcode, Length, Age(3), Code(6), Padding(2), Mac(6), Checksum]`
- **Exemple Anonymisé :**
  - **Hex :** `861100000A3132333441420000FFEEDDCCBBAAE9`
  - **Analyse :**
    - `86` : Opcode.
    - `11` : Longueur (17 octets).
    - `00 00 0A` : Âge (10 secondes).
    - `31 32 33 34 41 42` : Code utilisé ("1234AB" en ASCII, 6 octets).
    - `00 00` : **Padding obligatoire (2 octets)**.
    - `FF EE DD CC BB AA` : **Adresse MAC connectée (6 octets, Little Endian / Inversée)**.
      - Correspond à l'adresse MAC réelle `AA:BB:CC:DD:EE:FF`.
    - `E9` : Checksum.

### `CODE_KEY_VALID_HISTORY` (Opcode: `0x87`)
- **Exemple 1:**
  - **Hex:** `870900003c313233344142`
  - **Analyse:**
    - `87`: Opcode.
    - `09`: Longueur (9 octets).
    - `00 00 3c`: Age (60 secondes).
    - `31 32 33 34 41 42`: Code utilisé ("1234AB" en ASCII, 6 octets).

### `CODE_BLE_INVALID_HISTORY` (Opcode: `0x88`)
- **Structure du Paquet :** Identique à `0x86` (incluant le padding de 2 octets et la MAC inversée).
- **Exemple Anonymisé :**
  - **Hex :** `881100002A3132333435360000FFEEDDCCBBAA2F`
  - **Analyse :**
    - `88` : Opcode.
    - `11` : Longueur (17 octets).
    - `00 00 2A` : Âge (42 secondes).
    - `31 32 33 34 35 36` : Code PIN ("123456").
    - `00 00` : **Padding obligatoire (2 octets)**.
    - `FF EE DD CC BB AA` : **Adresse MAC (6 octets, Little Endian / Inversée)**.
    - `2F` : Checksum.

### `CODE_KEY_INVALID_HISTORY` (Opcode: `0x89`)
- **Exemple 1:**
  - **Hex:** `890900003c313233344142`
  - **Analyse:** Structure identique à `0x87`.

### `DOOR_CLOSE_HISTORY` (Opcode: `0x90`)
- **Exemple 1:**
  - **Hex:** `900300003c`
  - **Analyse:**
    - `90`: Opcode.
    - `03`: Longueur.
    - `00 00 3c`: Age (60 secondes).

### `DOOR_OPEN_HISTORY` (Opcode: `0x91`)
- **Exemple 1:**
  - **Hex:** `910300003c`
  - **Analyse:** Structure identique à `0x90`.

### `END_HISTORY` (Opcode: `0x92`)
- **Exemple 1:**
  - **Hex:** `920092`
  - **Analyse:** Fin de l'historique.

### `HISTORY_ERASE` (Opcode: `0x93`)
- **Exemple 1:**
  - **Hex:** `930093`
  - **Analyse:** Historique effacé.

### `POWER_OFF` (Opcode: `0x94`)
- **Exemple 1:**
  - **Hex:** `940400003c01`
  - **Analyse:**
    - `94`: Opcode.
    - `04`: Longueur.
    - `00 00 3c`: Age (60 secondes).
    - `01`: Raison (1=Watchdog, 2=Soft Reset, 3=Pin Reset, 4=Lockup, 5=GPIO, 6=LPCOMP, 7=Debug, 8=NFC).

### `BLOCK_RESET` (Opcode: `0x95`)
- **Exemple 1:**
  - **Hex:** `950300003c`
  - **Analyse:**
    - `95`: Opcode.
    - `03`: Longueur.
    - `00 00 3c`: Age (60 secondes).

### `POWER_ON` (Opcode: `0x96`)
- **Exemple 1:**
  - **Hex:** `960300003c`
  - **Analyse:**
    - `96`: Opcode.
    - `03`: Longueur.
    - `00 00 3c`: Age (60 secondes).

### `BLE_REBOOT` (Opcode: `0x97`)
- **Exemple 1:**
  - **Hex:** `970300003c`
  - **Analyse:**
    - `97`: Opcode.
    - `03`: Longueur.
    - `00 00 3c`: Age (60 secondes).

### `SCALE_CONTINUOUS_MEASURE` (Opcode: `0x98`)
- **Exemple 1:**
  - **Hex:** `98[LEN][AGE][DATA...]`
  - **Analyse:** Mesure continue.

### `KEY_OPENING` (Opcode: `0x99`)
- **Exemple 1:**
  - **Hex:** `990300003c`
  - **Analyse:**
    - `99`: Opcode.
    - `03`: Longueur.
    - `00 00 3c`: Age (60 secondes).

### `ERROR` (Opcode: `0xA0`)
- **Exemple 1:**
  - **Hex:** `A00400003c01`
  - **Analyse:**
    - `A0`: Opcode.
    - `04`: Longueur.
    - `00 00 3c`: Age (60 secondes).
    - `01`: Code d'erreur (1 octet).

### `NFC_OPENING` (Opcode: `0xA1`)
- **Exemple 1:**
  - **Hex:** `A1[LEN][AGE][TYPE][UID_LEN][UID...]`
  - **Analyse:**
    - `A1`: Opcode.
    - `LEN`: Longueur de la charge utile totale.
    - `AGE`: Age (3 octets, Big Endian).
    - `TYPE`: Type ou statut du tag NFC (1 octet).
    - `UID_LEN`: Longueur de l'UID (1 octet).
    - `UID...`: Données UID (longueur variable).

### `NFC_TAG_REGISTERING_SCAN` (Opcode: `0xA2`)
- **Exemple 1:**
  - **Hex:** `A2[LEN][AGE][DATA...]`
  - **Analyse:**
    - `A2`: Opcode.
    - `LEN`: Longueur de la charge utile totale.
    - `AGE`: Age (3 octets, Big Endian).
    - `DATA...`: Données spécifiques au scan d'enregistrement NFC (longueur variable, déterminée par LEN).

