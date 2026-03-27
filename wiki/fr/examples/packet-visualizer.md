# Visualiseur de Paquets

Le Visualiseur de Paquets est un outil pratique conçu pour décoder et afficher le contenu d'un paquet brut hexadécimal Bluetooth LE de Boks.

C'est particulièrement utile lors du débogage du trafic Bluetooth ou de l'analyse des journaux de paquets, ce qui permet de comprendre rapidement la structure, l'opcode, la longueur et les champs utiles (tels que les nombres de codes, les PIN, les configurations, etc.), directement cartographiés d'après la définition du protocole du SDK.

## Décodeur Interactif

Essayez de coller une chaîne hexadécimale brute dans le champ de saisie ci-dessous. Le visualiseur la décodera automatiquement, validera la somme de contrôle et décomposera les octets.

Par exemple, vous pouvez essayer avec : `c30700020cffd7`

<script setup>
import PacketVisualizer from '../../.vitepress/components/PacketVisualizer.vue'
</script>

<PacketVisualizer />

### Comment ça marche

1. **Opcode (Rose/Rouge) :** Le premier octet indique le type de commande ou de notification (ex: `C3` = `NOTIFY_CODES_COUNT`).
2. **Longueur (Vert) :** Le deuxième octet indique la longueur des données utiles qui suivent.
3. **Payload (Différentes couleurs) :** Les octets qui suivent l'octet de longueur sont découpés de manière dynamique en fonction des décorateurs définis dans le SDK (ex: `@PayloadUint16`, `@PayloadPinCode`).
4. **Somme de contrôle (Jaune) :** Le dernier octet est une somme de contrôle calculée pour vérifier l'intégrité des données.

Si la structure du payload ne correspond pas à la taille attendue, ou si la somme de contrôle est invalide, le visualiseur affichera une erreur ou laissera les octets non mappés en gris.
