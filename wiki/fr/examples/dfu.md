# Démo de Mise à jour (DFU)

Cette page explique comment flasher un firmware de manière interactive sur un appareil Boks via le Bluetooth Web en utilisant le protocole `web-bluetooth-dfu`.

> **Attention :** Flasher un mauvais firmware peut rendre votre appareil inutilisable. Assurez-vous d'utiliser un fichier `.zip` valide, spécialement compilé pour votre modèle Boks.

<DfuDemo />

## Comment ça marche

Le processus de mise à jour s'effectue en deux étapes :

1. **Collecte d'informations & Déclenchement du Mode DFU :**
   - Connexion à la Boks.
   - Lecture des informations de base (version, batterie) via les caractéristiques BLE standards (`0x180A`).
   - Envoi de la valeur `0x01` sur la caractéristique de contrôle DFU (`0xFE59` -> `8ec90001...`) pour redémarrer l'appareil en mode DFU.

2. **Installation de l'image (Flash) :**
   - L'appareil redémarre et se reconnecte sous le nom `DfuTarg` ou `Boks-xxx`.
   - Nous extrayons le `initData` et le `firmwareData` de l'archive `.zip`.
   - La librairie `@thib3113/web-bluetooth-dfu` gère l'envoi des fragments, la validation du CRC et l'écriture sur les caractéristiques DFU.
