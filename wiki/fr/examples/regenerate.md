# Démo de Re-Génération (Provisionnement)

<BoksGlobalProvider />

Cet outil interactif vous permet de générer en toute sécurité une nouvelle **Clé Maître** et de la provisionner sur un appareil Boks déjà initialisé.

::: danger AVERTISSEMENT CRITIQUE
**Cette opération remplace la Clé Maître existante.**
La nouvelle Clé Maître générée ici sera **stockée dans le LocalStorage de votre navigateur**.
Si vous perdez cette nouvelle clé, vous perdrez définitivement l'accès administratif à votre appareil.
**Sauvegardez toujours votre nouvelle clé immédiatement après sa génération.**
:::

<RegenerateKeyDemo />

## Comment l'utiliser

1.  **Connexion** : Cliquez sur "Scanner & Connecter" (ou démarrez le simulateur) dans le Contrôleur Global ci-dessous.
2.  **Authentification** : Assurez-vous d'avoir la Clé Maître *actuelle* active dans votre coffre (Vault).
3.  **Générer une Nouvelle Clé** : Cliquez sur "Générer une Nouvelle Clé Aléatoire" pour préparer une nouvelle clé.
4.  **Provisionner** : Cliquez sur "Provisionner la Nouvelle Clé" pour l'envoyer à l'appareil. Ce processus prend quelques secondes.

::: tip Note
Cet outil utilise l'API Web Bluetooth et nécessite un navigateur compatible (Chrome, Edge, Opera) et du matériel Bluetooth fonctionnel.
:::

<BoksPacketLogger />