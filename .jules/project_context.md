# Jules Context for Boks SDK

## Objectif
Le `boks-sdk-js` est la bibliothèque de référence pour toute la logique métier de Boks, extraite des applications Android et du firmware. Elle doit être utilisable dans `boks-web-ble`, Home Assistant (via portage ou service) et des outils de diagnostic autonomes.

## Domaines Clés
- **Algorithme PIN** : Variante BLAKE2s personnalisée avec IV SHA-256.
- **Master Key Generation** : Opcodes 0x20/0x21 (Token Parts A & B).
- **Packet Framing** : Format `[Opcode][Length][Payload][Checksum]`.
- **Code Conversion** : Passage de Single-use à Multi-use.

## Ressources de Référence
- `retro/firmware/boks_pin_algorithm.md` : Algorithme de génération de PIN.
- `retro/firmware/protocol_v4.5.1_analysis.md` : Opcodes et sécurité.
- `retro/firmware/protocol_v4.3.3_analysis.md` : Opcodes historiques.
- `ha_dev_env/custom_components/boks/` : Implémentations Python (BLE, Packets).

## Historique
- **2026-02-18** : Initialisation du SDK pour centraliser la logique après la découverte de l'algorithme PIN complet.
