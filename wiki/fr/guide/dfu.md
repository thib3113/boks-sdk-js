# Mises à jour du Firmware (DFU)

Les appareils Boks peuvent être mis à jour sans fil via le protocole **Device Firmware Update (DFU)** en Bluetooth. Cela permet au matériel de recevoir des corrections de bugs et de nouvelles fonctionnalités.

## Sécurité & Protection

Le système de mise à jour de la Boks est conçu pour être **protégé**. Le matériel utilise des paquets de firmware signés ; si un utilisateur tente d'envoyer un paquet de mise à jour falsifié ou invalide, la Boks refusera de l'installer.

## ⚠️ Avertissement Critique pour Boks V3 (Non-NFC / nRF52811)

Si vous possédez une **Boks Non-NFC** (également appelée Boks V3, fonctionnant sur une puce nRF52811), veuillez lire attentivement ce qui suit :

*   **Une mise à jour invalide ou interrompue supprimera le logiciel précédent.**
*   Dans ce cas, la Boks restera bloquée en "Mode DFU" (bootloader) en attendant une mise à jour logicielle valide et **ne redémarrera jamais** sur l'ancienne version.
*   Vous devrez impérativement fournir un fichier de firmware valide pour restaurer le fonctionnement.

Ce comportement est différent de la **Boks NFC** (V4 / nRF52833), qui peut redémarrer en toute sécurité sur son ancien logiciel si une mise à jour échoue.

## Comment mettre à jour

### Utilisation du SDK
Le SDK Boks lui-même n'inclut pas encore de client DFU intégré. Cependant, vous pouvez utiliser les fichiers de firmware récupérés via le SDK avec des outils standards.

### Mise à jour manuelle (Secours)
Si vous disposez du paquet `.zip` du firmware :
1.  Installez l'application **nRF Connect for Mobile** (disponible sur Android et iOS).
2.  Mettez votre Boks en mode DFU (cela se produit automatiquement lorsqu'un processus DFU est initié, ou après une mise à jour échouée).
3.  Connectez-vous à l'appareil (généralement nommé `DfuTarg` ou `Boks_DFU`).
4.  Téléchargez le fichier `.zip` du firmware en utilisant le bouton DFU de l'application.
