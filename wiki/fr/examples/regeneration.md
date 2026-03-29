# Démo Régénération Seed

<BoksGlobalProvider minSw="4.5.1" />

::: warning AVERTISSEMENT CRITIQUE
Ce logiciel est actuellement **théorique** et n'a **pas été testé sur du vrai matériel**.
L'utilisation de ce processus d'régénération va probablement **casser la compatibilité avec l'application Boks officielle**.
À utiliser à vos risques et périls. Ceci est un logiciel issu d'ingénierie inverse.
:::

Utilisez cette démo interactive pour remplacer la Clé Maître actuelle par une nouvelle seed connue, afin de pouvoir gérer vos codes hors-ligne. Vous pouvez saisir votre **Clé de Configuration** (8 caractères) manuellement ci-dessous, ou la laisser se remplir automatiquement si vous êtes déjà connecté à une session.

### Téléchargements automatiques durant ce processus

Afin d'assurer votre sécurité et de permettre une investigation en cas de problème, cette démo déclenchera deux téléchargements automatiques :
1. **Avant le début de la régénération :** Un fichier `.txt` contenant votre nouvelle Clé Maître sera téléchargé. **Conservez ce fichier précieusement !** C'est votre seul moyen de récupérer l'accès si le processus échoue en cours de route.
2. **Juste après l'envoi de la clé :** Un fichier journal (log) contenant l'échange Bluetooth sera téléchargé automatiquement. Si le processus se bloque, vous pourrez utiliser ce fichier pour comprendre à quel moment l'échec s'est produit.

<RegenerationDemo />

### Dépannage (Troubleshooting)

Si vous avez terminé avec succès le processus de régénération mais que vous constatez que vos nouveaux codes hors ligne **sont rejetés**, alors que votre clé de configuration (Config Key) est toujours acceptée par la Boks (par exemple via le tableau de bord ou lors d'une nouvelle régénération), vous rencontrez peut-être un problème connu avec les firmwares >= 4.5.1.

Sur les firmwares plus récents, la Boks peut subir une réinitialisation Watchdog (Watchdog reset) immédiatement après avoir accepté la nouvelle clé.

**Solution :** Si cela se produit, essayez de remplacer les **16 premiers caractères** de votre nouvelle clé maître de 64 caractères par des zéros (ex. : `0000000000000000<reste_de_la_cle>`). Vos codes devraient alors fonctionner correctement.

<BoksDashboard />
