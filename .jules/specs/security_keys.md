# Gestion des Clés de Sécurité (MasterKey & ConfigKey)

Ce document détaille la hiérarchie et la dérivation des clés utilisées pour sécuriser les communications et le stockage de la Boks.

## 1. La MasterKey (Clé Maîtresse)

La `MasterKey` est le secret racine du système.

*   **Format** : 32 octets binaires (souvent représentés par 64 caractères hexadécimaux).
*   **Rôle** :
    *   Sert de "Seed" pour l'algorithme SHA-256 modifié qui génère les codes PIN.
    *   Sert de base pour dériver la `configurationKey`.
*   **Stockage Flash (Protection)** :
    *   Lorsqu'elle est écrite dans la mémoire flash du boîtier, le firmware **met à zéro les 8 premiers octets** (64 bits).
    *   **Théorie de Protection** : Cette manipulation vise à protéger le secret contre une lecture physique de la flash. Même si un attaquant extrait le contenu de la puce, il ne récupère qu'une clé partielle (192 bits sur 256), rendant la reconstruction de la base de codes ou de la ConfigKey plus difficile.
    *   **Conséquence** : La clé complète de 32 octets doit être fournie au SDK pour pouvoir effectuer des opérations de régénération ou de calcul de codes.

## 2. La ConfigurationKey (Clé de Configuration)

La `configurationKey` (ou `ConfigKey`) est un jeton d'autorisation requis par le firmware pour valider les commandes BLE sensibles (création/suppression de codes, changement de configuration, etc.).

*   **Dérivation** : Elle est dérivée des **8 derniers caractères hexadécimaux** de la `MasterKey`.
*   **Format de Transmission** : Bien que mathématiquement issue de la clé binaire, elle est transmise et traitée en **ASCII** (8 octets).
    *   *Exemple* : Si la fin de la MasterKey en hex est `...A1B2C3D4`, la ConfigKey envoyée sera `[0x41, 0x31, 0x42, 0x32, 0x43, 0x33, 0x44, 0x34]`.
*   **Validation Firmware** : Le firmware compare ces 8 octets ASCII avec ceux stockés pour autoriser l'exécution de la commande.

## 3. Opcodes Requérant la ConfigKey

L'utilisation de la `configurationKey` est obligatoire pour toutes les commandes administratives et de configuration. La liste complète des opcodes est disponible dans le document de référence du protocole.
