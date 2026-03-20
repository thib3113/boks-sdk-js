# Batterie & Matériel

<BoksGlobalProvider />

Cet exemple montre comment récupérer les informations matérielles et les statistiques de batterie détaillées d'une Boks.

<BatteryDemo />

## Utilisation du Code

Vous pouvez accéder aux informations matérielles et aux niveaux de batterie via le `BoksController`.

### Informations Matérielles

Lors de la connexion, le contrôleur récupère automatiquement la révision du micrologiciel et déduit la version matérielle.

```typescript
import { BoksController } from 'boks-sdk';

const controller = new BoksController();
await controller.connect();

// Accès aux informations matérielles
const info = controller.hardwareInfo;

if (info) {
  console.log('Version Matérielle:', info.hardwareVersion); // ex: "4.0"
  console.log('Révision Firmware:', info.firmwareRevision); // ex: "10/125"
  console.log('Chipset:', info.chipset); // ex: "nRF52833"
}
```

### Niveaux de Batterie

Vous pouvez demander le niveau de batterie standard (0-100%) ou les statistiques détaillées fournies par le service personnalisé Boks.

```typescript
// Niveau de Batterie Bluetooth Standard
const level = await controller.getBatteryLevel();
console.log(`Batterie: ${level}%`);

// Statistiques de Batterie Détaillées (Boks)
const stats = await controller.getBatteryStats();

if (stats) {
  console.log(`Niveau Principal: ${stats.level}%`);
  console.log(`Température: ${stats.temperature}°C`);

  // Détails avancés (min, max, moyenne, etc.)
  console.log('Détails:', stats.details);
}
```

::: tip Note
Les statistiques de batterie sont lues depuis une caractéristique personnalisée et fournissent plus d'informations que le service standard, notamment la température et l'historique des mesures.
:::

<BoksDashboard />
