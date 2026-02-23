# Glossaire

### Master Key (Clé Maîtresse)
Une clé secrète de 32 octets qui sert de "racine de confiance" pour un appareil Boks. Elle est utilisée pour dériver tous les codes PIN temporaires.

### Configuration Key (Clé de Configuration / ConfigKey)
Une chaîne hexadécimale de 8 caractères dérivée de la Master Key. Elle agit comme un mot de passe administratif pour les opérations BLE sensibles (ex: création de codes, changement de paramètres).

### Code permanent
Un code PIN permanent (6 caractères) stocké directement dans l'un des emplacements indexés de l'appareil (0-4).

### Single-Use Code (Code à Usage Unique)
Un code PIN temporaire dérivé de la Master Key qui devient invalide après avoir été utilisé une fois pour ouvrir la porte.

### Multi-Use Code (Code Multi-Usages)
Un code PIN temporaire dérivé de la Master Key qui peut être utilisé plusieurs fois.

### Uplink (Lien Montant)
Communication du matériel Boks vers le client (Smartphone ou Link).

### Downlink (Lien Descendant)
Communication du client vers le matériel Boks.
