# Analyse de la Communication Bluetooth

Ce document décrit le modèle de sécurité et les modes d'interaction Bluetooth du boîtier Boks.

Pour les détails techniques des paquets et la liste exhaustive des commandes, se référer au **Protocole Bluetooth (Opcodes & Paquets)**.

## 1. Sécurité et Authentification

Contrairement à de nombreux objets connectés, la Boks **n'utilise pas l'appairage BLE standard (Bonding)** ni le chiffrement natif de la couche Bluetooth. La connexion est directe ("Open") au niveau système.

La sécurité repose entièrement sur la **couche applicative** :
1.  **Obscurité du Protocole** : Usage d'un service et de caractéristiques propriétaires.
2.  **Validation par ConfigKey** : Les commandes sensibles (ouverture, configuration, gestion des codes) ne sont exécutées que si elles contiennent la `configurationKey` correcte.
    *   Voir **Gestion des Clés (MasterKey & ConfigKey)** pour les détails de dérivation.

## 2. Lecture Directe (Hors Protocole)

Certaines données de diagnostic sont accessibles par lecture directe de caractéristiques spécifiques, sans passer par le système de commandes/réponses :
*   **Tension et Température** : Lecture sur le handle `0004`. Le format renvoie 5 mesures de tension batterie et la température interne.
