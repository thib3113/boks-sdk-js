# Analyse de la Régénération des Codes

## 0. Version Requise
Cette fonctionnalité est conditionnée à une version spécifique du firmware (4.5.1 minimale) qui supporte les Opcodes de régénération (`0x20/0x21`).

## 1. Objectif
**⚠️ Distinction Importante :**
Ce document concerne la **Master Key (Clé Maîtresse)** cryptographique de 32 octets, utilisée pour générer les codes temporaires.
Ne pas confondre avec le **Master Code** (Opcode `0x11`), qui désigne un code PIN permanent saisi par l'utilisateur.

L'objectif est de permettre la mise à jour ou le remplacement de la clé maîtresse utilisée pour générer les codes d'accès.

## 2. Workflow Global

Le workflow de régénération implique la génération d'un nouveau secret et sa propagation vers les différents composants du système.

### Étape A : Génération de la Graine
Une nouvelle clé de 32 octets aléatoires cryptographiquement sûrs est générée.

### Étape B : Synchronisation distante
Le nouveau secret doit être synchronisé avec le backend Boks afin de maintenir la cohérence de la génération des codes entre les différents accès.

### Étape C : Envoi à la Boks (BLE)
La clé de 32 octets est transmise à la Boks via deux commandes BLE successives utilisant le service principal.

**Commande 1 : `RE_GENERATE_CODES_PART1`**
*   **OpCode :** `0x20`
*   **Structure :** `[0x20, Length, ...ConfigKey, ...MasterKey_Part1 (16 bytes)]`
*   **Paramètres :**
    *   `ConfigKey` : Clé de configuration (8 octets ASCII).
    *   `MasterKey_Part1` : Les 16 premiers octets de la nouvelle Master Key.

**Commande 2 : `RE_GENERATE_CODES_PART2`**
*   **OpCode :** `0x21`
*   **Structure :** `[0x21, Length, ...ConfigKey, ...MasterKey_Part2 (16 bytes)]`
*   **Paramètres :**
    *   `ConfigKey` : Clé de configuration (8 octets ASCII).
    *   `MasterKey_Part2` : Les 16 derniers octets de la nouvelle Master Key.

## 3. Sécurité
La réussite de l'opération est conditionnée par la validation de la `ConfigKey` par le firmware. Une clé incorrecte entraînera une erreur de protocole (`0xE1` Unauthorized).

