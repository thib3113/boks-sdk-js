# Protocole BLE & Workflows

Le SDK Boks communique avec le matériel via Bluetooth Low Energy (BLE) en utilisant un service GATT propriétaire. La communication est asynchrone et basée sur un modèle requête/réponse piloté par des opcodes.

## Services & Caractéristiques GATT

| Service | UUID | Usage |
|---------|------|-------|
| **Service Boks** | `a7630001-f491-4f21-95ea-846ba586e361` | Service de communication principal |
| **Infos Appareil** | `0000180a-0000-1000-8000-00805f9b34fb` | Versioning et infos matériel |
| **Service Batterie** | `0000180f-0000-1000-8000-00805f9b34fb` | Niveau de batterie standard |

### Caractéristiques (Service Boks)

- **Write** (`a7630002-...`) : Utilisé pour envoyer des commandes (**Downlink**).
- **Notify** (`a7630003-...`) : Utilisé par l'appareil pour envoyer des mises à jour de statut et des réponses (**Uplink**).

---

## Structure des Paquets

Tous les paquets suivent un format binaire cohérent :

`[Opcode (1 octet)] [Longueur (1 octet)] [Charge utile (N octets)] [Checksum (1 octet)]`

- **Opcode** : Identifie le type de commande ou de notification.
- **Longueur** : Nombre d'octets dans la charge utile (payload).
- **Payload** : Les données réelles (arguments ou résultats).
- **Checksum** : Somme de 8 bits de tous les octets précédents (`sum & 0xFF`).

---

## Workflows Opérationnels

### 1. Gestion des Codes
L'appareil gère trois types distincts de codes d'accès :

*   **Codes permanents** : PINs stockés dans 5 emplacements dédiés (0-4).
*   **Single-Use Codes** : PINs temporaires qui expirent immédiatement après une ouverture réussie.
*   **Multi-Use Codes** : PINs temporaires réutilisables. *Note : La génération de ces codes est désactivée dans les versions de firmware > 4.3.3.*

**Authentification** : La plupart des opérations sur les codes (Création, Édition, Suppression) nécessitent une **ConfigKey** (8 octets) au début de la payload pour autoriser la modification.

### 2. Transfert d'Historique en Rafale (le "Burst")
Lorsque l'historique est demandé (`0x03 REQUEST_LOGS`), l'appareil entre dans un mode de notification rapide :

1.  Le client envoie `0x03`.
2.  L'appareil envoie une séquence de paquets de notification, un pour chaque événement enregistré.
3.  Chaque payload d'événement commence par un **Âge sur 3 octets** (secondes écoulées depuis l'événement, Big Endian).
4.  La séquence se termine **toujours** par un paquet `0x92 END_HISTORY`.

### 3. Workflow des Tags NFC
L'enregistrement d'un tag NFC est un processus de "Découverte" en deux étapes :

1.  **Scan** : Envoyer `0x17 REGISTER_NFC_TAG_SCAN_START`. La LED de l'appareil clignote généralement.
2.  **Détection** : Lorsqu'un tag est présenté, l'appareil émet `0xC5 NOTIFY_NFC_TAG_FOUND` contenant l'UID brut.
3.  **Enregistrement** : Pour persister le tag, le client doit envoyer `0x18 REGISTER_NFC_TAG` avec l'UID et la **ConfigKey**.

---

## Registre des Commandes (Opcodes courants)

### Contrôle & Statut
| Opcode | Nom | Payload |
|--------|-----|---------|
| `0x01` | OPEN_DOOR | `[PIN(6)]` |
| `0x02` | ASK_DOOR_STATUS | (Vide) |
| `0x06` | REBOOT | (Vide) |
| `0x08` | TEST_BATTERY | (Vide) |

### Administratif (Requiert ConfigKey)
| Opcode | Nom | Payload |
|--------|-----|---------|
| `0x11` | CREATE_MASTER_CODE | `[Key(8)] [PIN(6)] [Index(1)] (Crée un code permanent)` |
| `0x12` | CREATE_SINGLE_USE | `[Key(8)] [PIN(6)]` |
| `0x0D` | DELETE_SINGLE_USE | `[Key(8)] [PIN(6)]` |
| `0x16` | SET_CONFIGURATION | `[Key(8)] [Type(1)] [Value(1)]` |

### Notifications (Uplink)
| Opcode | Nom | Description |
|--------|-----|-------------|
| `0x77` | SUCCESS | Commande acquittée. |
| `0x78` | ERROR | Échec de la commande (souvent auth ou format). |
| `0x81` | VALID_PIN | La porte s'ouvre. |
| `0x82` | INVALID_PIN | Accès refusé. |
| `0x84` | DOOR_STATUS | `0x00` (Fermée) / `0x01` (Ouverte). |
| `0xC3` | CODES_COUNT | `[Master(2)] [Autres(2)]` (Big Endian). |
