# Sécurité & Dépannage

## Délai de Sécurité à l'Ouverture

Pour prévenir les problèmes mécaniques et assurer un fonctionnement fiable, le SDK Boks impose un **délai obligatoire d'une seconde** entre deux appels consécutifs à `openDoor()`.

Si vous tentez d'ouvrir la porte de nouveau moins d'une seconde après la tentative précédente, le SDK lèvera une `BoksClientError` avec l'identifiant `RATE_LIMIT_REACHED`.

```typescript
try {
  await controller.openDoor('123456');
  // ... tentative immédiate
  await controller.openDoor('123456');
} catch (error) {
  if (error.id === 'RATE_LIMIT_REACHED') {
    console.error('Veuillez patienter un instant avant de réessayer.');
  }
}
```

## Le Problème du "Moteur Bloqué"

Le mécanisme de verrouillage des boîtes Boks utilise un moteur qui fonctionne en deux étapes. Des commandes d'ouverture répétées trop rapidement peuvent interrompre ce cycle, figeant le moteur dans un état intermédiaire.

### Symptômes
- La porte est physiquement ouverte mais l'appareil pense qu'elle ne l'est pas complètement.
- L'appareil refuse de se verrouiller ou de se fermer correctement.
- Vous entendez le moteur essayer de bouger mais rester coincé.

### Solution Manuelle
Si vous rencontrez ce problème, suivez ces étapes pour réinitialiser le mécanisme :

1.  **Maintenez la porte fermée manuellement.** Vous devez appliquer une pression pour garder la porte en position fermée, contrant la tentative de la serrure de se rouvrir ou de rester ouverte.
2.  **Entrez un code PIN valide.** Utilisez le clavier ou l'application pour déclencher une séquence d'ouverture standard.
3.  **Laissez la porte s'ouvrir normalement.** Relâchez la porte lorsque le mécanisme se déverrouille.
4.  **Fermez la porte.** Le mécanisme devrait maintenant être réinitialisé et fonctionner correctement.

Cette procédure force le moteur à compléter son cycle complet, réalignant les engrenages et capteurs internes.
