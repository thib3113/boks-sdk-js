# Diagnostic Santé Matérielle

<BoksGlobalProvider />

Cette démo interactive vous permet de surveiller l'état de santé physique de votre appareil Boks grâce aux données des capteurs en temps réel.

## Fonctionnalités

- **Batterie Générique** : Le pourcentage de batterie standard rapporté par l'appareil.
- **Température Interne** : La température à l'intérieur du boîtier Boks (mesurée près de la carte principale).
- **Tensions Détaillées** : Mesure de la tension en temps réel pour chacune des piles internes.

::: warning OPÉRATION MOTEUR REQUISE
Le firmware de la Boks ne met à jour les mesures de tension détaillées qu'après une opération du moteur (ouverture de la porte). Si les valeurs semblent obsolètes ou ne s'affichent pas, essayez de cliquer sur le bouton "Ouvrir la Porte" pour forcer une actualisation.
:::

<HardwareHealthDemo />

<BoksDashboard />
