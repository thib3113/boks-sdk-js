# Génération de PIN Hors-Ligne

L'écosystème Boks permet de générer des codes d'accès localement sans aucune connexion internet, à condition de posséder la **Clé Maître** de l'appareil. Cela garantit que votre boîte à colis reste pleinement fonctionnelle même si le cloud officiel Boks est indisponible.

## Comment ça marche ?

Les codes d'accès (PINs) sont dérivés de la Clé Maître de 32 octets à l'aide d'un algorithme personnalisé basé sur **BLAKE2s**. Le matériel utilise le même algorithme déterministe pour valider les codes que vous tapez sur le clavier.

Pour plus de détails sur les mathématiques sous-jacentes, consultez le [Guide de l'Algorithme PIN](../guide/pin-algorithm).

## Générateur Interactif

Utilisez cet outil pour générer des codes PIN valides. Si vous êtes connecté au Simulateur ou à une vraie Boks, votre Clé Maître active sera pré-remplie automatiquement.

<OfflinePinDemo />

## Utilisation dans le Code

Vous pouvez utiliser l'utilitaire `generateBoksPin` du SDK pour intégrer cela dans votre propre application :

```typescript
import { generateBoksPin, hexToBytes } from '@thib3113/boks-sdk';

const masterKey = 'VOTRE_CLE_MAITRE_HEX_64_CHARS';
const keyBytes = hexToBytes(masterKey);

// Générer un Code Maître (index 0)
const masterPin = generateBoksPin(keyBytes, 'master', 0);
console.log(`PIN Maître : ${masterPin}`);

// Générer un code à Usage Unique (index 123)
const singlePin = generateBoksPin(keyBytes, 'single-use', 123);
console.log(`PIN Usage Unique : ${singlePin}`);
```

::: tip NOTE DE RÉCUPÉRATION
Si vous perdez votre Clé Maître, vous ne pourrez plus générer de codes hors-ligne. Conservez toujours une sauvegarde sécurisée de votre clé !
:::

<BoksDashboard />
