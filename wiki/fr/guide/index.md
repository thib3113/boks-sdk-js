# Guide de Démarrage

Bienvenue dans la documentation du **SDK Boks**. Ce projet non-officiel permet d'interagir avec les boîtes à colis connectées Boks via Bluetooth Low Energy (BLE).

## Installation

Installez le SDK via votre gestionnaire de paquets préféré :

```bash
pnpm add @thib3113/boks-sdk
```

## Utilisation de Base

Voici comment ouvrir votre Boks en quelques lignes de code (dans un environnement supportant Web Bluetooth) :

```typescript
import { BoksController } from '@thib3113/boks-sdk';

// 1. Initialiser le contrôleur
const controller = new BoksController();

// 2. Se connecter (déclenche le sélecteur Bluetooth du navigateur)
await controller.connect();

// 3. Ouvrir la porte avec votre PIN
const success = await controller.openDoor('123456');

if (success) {
  console.log("La Boks est ouverte !");
}
```

## Fonctionnalités Avancées

Pour les opérations administratives, vous devrez configurer vos identifiants :

```typescript
// Définir la Master Key pour permettre la gestion des codes
controller.setCredentials('VOTRE_MASTER_KEY_64_CHARS');

// Créer un code à usage unique
await controller.createSingleUseCode('654321');
```

Consultez le guide [Récupérer ses Clés](./credentials) pour savoir comment obtenir votre Master Key.
