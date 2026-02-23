# Historique & Évolution du Firmware

Le firmware Boks a évolué à travers plusieurs jalons fonctionnels majeurs. Cette page retrace l'évolution du protocole et des capacités matérielles.

## Tableau Récapitulatif

| Version | Jalon Clé | Changements Principaux |
|---------|-----------|------------------------|
| **4.2.0** | **Support Vigik** | Ajout du support pour le protocole d'accès Vigik. |
| **4.3.3** | **Tags NFC Utilisateurs** | Introduction du support pour la découverte et l'enregistrement de tags NFC classiques. |
| **4.5.1** | **Fonctions de Régénération** | Ajout des opcodes `0x20/0x21` pour remplacer la `masterKey` et tous les codes hors-ligne. |
| **4.6.0** | **Sécurité des Logs** | Les codes PIN ne sont plus retournés dans l'historique (remplacés par des index). |

---

## Évolution Détaillée

### Version 4.2.0 : Intégration Vigik
Cette version a introduit la possibilité d'ouvrir la Boks à l'aide d'identifiants compatibles Vigik, principalement utilisés par les services de livraison officiels.

### Version 4.3.3 : Tags NFC Utilisateurs
- **Gestion des Tags** : Les utilisateurs peuvent désormais scanner et enregistrer leurs propres badges NFC pour ouvrir la boîte sans code PIN ni smartphone.
- **Codes Multi-Usages** : Il s'agit de la dernière version supportant la génération de **Codes Multi-Usages**. Cette fonctionnalité est désactivée dans toutes les versions strictement supérieures à 4.3.3.

### Version 4.5.1 : Remplacement de Clés et Codes
- **Provisioning 2.0** : Introduction du workflow de "Régénération". Contrairement au `GENERATE_CODES` (0x10) initial, les nouveaux opcodes `0x20` (Partie A) et `0x21` (Partie B) permettent de remplacer complètement la `masterKey` et le pool de codes hors-ligne associé.

### Version 4.6.0 : Confidentialité des Logs
- **Masquage des PIN** : Pour empêcher des utilisateurs non autorisés de récupérer des codes valides en écoutant le flux d'historique, le firmware ne retourne plus le PIN brut de 6 caractères.
- **Logs basés sur l'index** : La charge utile du log contient désormais un index de référence :
    - **MCxxxx** : Représente un code **Permanent**.
    - **UCxxxx** : Représente un code à **Usage Unique** (Single-Use).
    - *Exemple* : Au lieu de `"123456"`, le log retournera par exemple `"MC0001"`.

---

## Modèles Spécifiques

### Boks Professionnelle
La gestion de la balance intégrée (Opcodes `0x50` à `0x62`) est disponible sur les **modèles Professionnels**. Ces commandes permettent l'appairage d'une balance Boks, la tare et la lecture du poids en temps réel.
