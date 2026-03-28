# Mise à jour Firmware (DFU)

<ClientOnly>
  <DfuDemo />
</ClientOnly>

## Aperçu

La mise à jour de firmware (DFU) est le processus de mise à niveau du logiciel interne exécuté sur votre Boks. Cet outil vous permet de le faire directement depuis votre navigateur à l'aide de Web Bluetooth.

Le processus de mise à jour s'effectue en deux étapes principales :

### Étape 1 : Préparation (Passage en mode DFU)

Dans son état de fonctionnement normal, la Boks n'accepte pas directement les mises à jour de firmware pour des raisons de sécurité et de stabilité.

1.  Connectez-vous d'abord à votre Boks via le contrôleur global en bas de l'écran.
2.  Le contrôleur vérifiera votre version matérielle et le niveau de batterie.
3.  Si la batterie est saine, cliquez sur **"Passer en mode DFU"**.
4.  L'application enverra une commande spécifique (écriture de `0x01` sur la caractéristique `8ec90001-f315-4f60-9fb8-838830daea50` du service DFU `0000fe59-0000-1000-8000-00805f9b34fb`).
5.  Votre Boks va redémarrer. Elle diffusera désormais un nom différent : `DfuTarg` ou `Boks_DFU`.

### Étape 2 : Flashage du Firmware

Une fois votre appareil en mode DFU, l'interface passera automatiquement au panneau de flashage.

1.  Sélectionnez le fichier firmware `.zip` fourni pour votre révision matérielle Boks spécifique.
2.  Cliquez sur **"Démarrer le Flashage"**.
3.  Le navigateur va négocier avec le bootloader et commencer à transférer les fragments de firmware.
4.  **Ne fermez pas l'onglet et n'éteignez pas votre ordinateur pendant ce processus.**

Une fois le transfert à 100%, la Boks validera le firmware et redémarrera automatiquement sur le nouveau système d'exploitation.

---

## Sécurité & Dépannage

Les mises à jour de firmware impliquent la réécriture de la mémoire principale de l'appareil. Bien que le matériel Boks soit conçu pour être résilient, les interruptions peuvent rendre l'appareil temporairement indisponible.

### Mises à jour Interrompues

Si le processus de mise à jour est interrompu (ex: votre ordinateur se met en veille, l'onglet du navigateur est fermé, ou la connexion Bluetooth est perdue), le comportement dépend de votre version matérielle :

-   **Boks V3 (nRF52811) :** L'appareil sera **temporairement indisponible** ou "bloqué en mode mise à jour" (`DfuTarg`). Il ne répondra pas aux commandes normales ni au bouton physique. **Ne paniquez pas.** Pour le restaurer, il suffit de se reconnecter à l'appareil `DfuTarg` et de réussir à nouveau le processus de flashage complet depuis l'Étape 2.
-   **Boks V4 (nRF52833) :** Ces appareils gèrent mieux les interruptions. Souvent, il suffit de retirer les piles et de les réinsérer pour restaurer l'appareil à son état de fonctionnement précédent.

### Fichiers de Firmware Invalides

Le bootloader refusera de flasher un fichier firmware qui est corrompu ou destiné à une version matérielle différente. Si vous voyez une erreur comme :

> "Le fichier de firmware est invalide ou corrompu pour ce modèle."

ou

> "Ce firmware n'est pas compatible avec la version matérielle de votre Boks."

Veuillez vérifier que vous avez téléchargé le bon fichier `.zip` pour votre modèle spécifique de Boks (ex: V3 vs V4).
