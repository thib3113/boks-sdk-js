# Jules Context for Boks SDK

## Objectif
Le `boks-sdk-js` est la bibliothèque de référence centralisant toute la logique métier et protocolaire de l'écosystème Boks. Elle permet la communication avec les boîtes à colis Boks via Bluetooth Low Energy (BLE).

## Architecture
- **Transport Abstraction** : Le SDK est agnostique de la couche physique. Il définit l'interface `BoksTransport`, permettant une implémentation pour n'importe quel environnement : Web Bluetooth (fournie), Cordova, Capacitor, Node-BLE, ou React Native.
- **Sequential Queue** : Toute commande envoyée est mise en file d'attente pour garantir un flux séquentiel sur le lien BLE, évitant les collisions de caractéristiques.
- **Strict Parsing** : Utilisation de Factory Methods statiques (`fromPayload`) pour garantir que tout objet instancié est valide.
- **Event-Based Logging** : Système de monitoring sans pollution de console, basé sur des événements typés.

## Ressources de Référence
Consultez les spécifications détaillées dans le dossier `.jules/specs/` :
- `bluetooth_protocol.md` : Opcodes, framing et checksum.
- `security_keys.md` : Gestion de la Master Key et de la Config Key.
- `boks_pin_algorithm.md` : Détails de l'algorithme BLAKE2s/SHA-256.
- `analyse_code_regeneration.md` : Workflows de régénération (0x20/0x21).
- `bluetooth_communication.md` : Analyse globale des échanges.

