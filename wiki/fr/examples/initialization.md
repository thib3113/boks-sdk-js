# Démo d'Initialisation

<BoksGlobalProvider />

Cet outil interactif vous permet de générer en toute sécurité une **Clé Maître** et d'initialiser un appareil Boks.

::: danger AVERTISSEMENT CRITIQUE
**Cette opération est irréversible sans la Clé Maître.**
La Clé Maître générée ici est **stockée dans le LocalStorage de votre navigateur**.
Si vous effacez les données de votre navigateur ou perdez cette clé, vous perdrez définitivement l'accès administratif à votre appareil.
**Sauvegardez toujours votre clé immédiatement après sa génération.**
:::

<InitializationDemo />

## Comment l'utiliser

1.  **Connexion** : Cliquez sur "Scanner & Connecter" et sélectionnez votre appareil Boks.
2.  **Générer une Clé** : Si vous n'avez pas de clé, générez-en une. Elle sera sauvegardée automatiquement.
3.  **Initialiser** : Une fois connecté et une clé active, cliquez sur "Initialiser l'appareil".

::: tip Note
Cet outil utilise l'API Web Bluetooth et nécessite un navigateur compatible (Chrome, Edge, Opera) et du matériel Bluetooth fonctionnel.
:::

<BoksPacketLogger />
