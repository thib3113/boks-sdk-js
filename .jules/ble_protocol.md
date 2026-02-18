# Spécifications du Protocole BLE Boks

## Identifiants (UUIDs)
- **Service Principal** : `A7630001-F491-4F21-95EA-846BA586E361`
- **Caractéristique d'Écriture (Downlink)** : `A7630002-F491-4F21-95EA-846BA586E361`
- **Caractéristique de Notification (Uplink)** : `A7630003-F491-4F21-95EA-846BA586E361`

## Structure des Paquets
Chaque échange BLE suit le format suivant :
`[Opcode (1), Length (1), Payload (N), Checksum (1)]`

### Opcode
Un octet identifiant la commande ou la notification.

### Length
Un octet indiquant la longueur de la charge utile (Payload) uniquement.

### Checksum
Calculé sur l'intégralité du paquet précédent : `(Opcode + Length + Sum(Payload)) & 0xFF`.

## Authentification (ConfigKey)
Certaines commandes sensibles requièrent une `ConfigKey` de 8 caractères ASCII (Hexadecimal Uppercase).
Elle est toujours placée au début du Payload.

## Gestion du Temps (Historique)
Les événements d'historique (Logs) incluent un champ **Age** de 3 octets (Big Endian) représentant le nombre de secondes écoulées depuis l'événement.
`Timestamp_Réel = Temps_Actuel - Age`.
