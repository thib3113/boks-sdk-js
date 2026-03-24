# Mise à jour Firmware (DFU)

Cette démo interactive vous permet de mettre à jour le firmware de votre appareil Boks. Elle utilise la bibliothèque `@thib3113/web-bluetooth-dfu` pour flasher de manière sécurisée les paquets de mise à jour `.zip` de Nordic Semiconductor.

::: warning Contexte Sécurisé Requis
Web Bluetooth nécessite un contexte sécurisé. Vous devez accéder à cette page via HTTPS (ou localhost) pour que la mise à jour fonctionne.
:::

## Comment ça marche

La mise à jour du firmware est un processus en deux étapes :

1. **Préparation (Mode Normal)** :
   - Lorsque vous vous connectez à votre appareil Boks (ex : `Boks-1234`), l'outil lit les versions actuelles du matériel, du logiciel et le niveau de la batterie.
   - Si la batterie est inférieure à 20 %, vous serez averti de la changer avant de continuer.
   - En appuyant sur "Passer en mode DFU", l'outil écrit `0x01` dans la caractéristique de contrôle DFU, ce qui provoque le redémarrage de l'appareil dans un état de bootloader spécialisé.

2. **Flashage (Mode DFU)** :
   - Une fois l'appareil redémarré, il s'annoncera sous le nom de `DfuTarg` ou `Boks_DFU`.
   - Vous pouvez immédiatement sélectionner votre fichier `.zip` de firmware et démarrer le processus de flashage.
   - L'appareil redémarrera en fonctionnement normal une fois le transfert vérifié et terminé.

## FAQ Cruciale & Informations de Sécurité

::: danger Récupération suite à une interruption
Tous les appareils Boks ne récupèrent pas d'une DFU interrompue de la même manière.

* **Boks V3 (nRF52811)** : Si la mise à jour est interrompue (navigateur fermé, coupure de courant), l'appareil sera **temporairement indisponible** ou **bloqué en mode mise à jour**. Il reste dans l'état du bootloader, empêchant toute interaction normale. Il suffit de réussir un nouveau flash pour restaurer l'appareil.
* **Boks V4 (nRF52833)** : Le bootloader sur les appareils plus récents gère les interruptions plus gracieusement. Un retrait de la batterie (retirer et réinsérer les piles) peut généralement restaurer l'appareil à son état précédent.
:::

**Q: Puis-je flasher une version plus ancienne (downgrade) ?**
R: Généralement, non. Le bootloader contient une protection contre le downgrade (Erreur `0x0E`). Vous ne pouvez flasher que des versions égales ou supérieures à votre installation actuelle.

**Q: Que se passe-t-il si je flashe un firmware non signé par Boks ?**
R: Le bootloader DFU nécessite des paquets de firmware signés cryptographiquement. Flasher des zips non signés ou mal signés entraînera une Erreur d'Authentification (`0x0C`).

<DfuDemo />

<BoksDashboard />
