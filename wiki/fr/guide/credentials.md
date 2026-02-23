# Récupérer ses Clés

Pour interagir avec un appareil Boks via ce SDK, vous avez besoin d'identifiants spécifiques. Alors que les opérations de base (ouverture de porte) ne nécessitent que le **Code permanent (PIN)**, les opérations administratives (gestion des codes, changement de paramètres) requièrent la **Clé de Configuration** (ConfigKey) ou la **Clé Maîtresse** (Master Key).

## Concepts Clés

- **ConfigKey** : Une chaîne hexadécimale de 8 caractères (ex: `A1B2C3D4`) utilisée pour authentifier les commandes BLE sensibles.
- **Master Key** : Une clé racine de 32 octets (64 caractères hex). La ConfigKey est dérivée de ses 4 derniers octets. Fournir la Master Key au SDK permet la **génération de PIN hors-ligne**.

---

## Méthode 1 : API Cloud (Recommandé)

Le moyen le plus simple de récupérer vos clés est d'interroger l'API Cloud officielle de Boks. Vos clés y sont stockées car votre compte Boks a été synchronisé avec leurs serveurs lors de l'installation initiale.

### Prérequis : Compte "Migré"
Notez que Boks exige que les comptes soient "migrés" vers leur nouveau système. Si votre compte n'est pas migré ou est bloqué dans l'application officielle, l'API peut retourner des clés vides.

### Utiliser un script de récupération
Vous pouvez utiliser un script simple pour récupérer vos clés. L'outil recommandé est le script [get_config_key.py](https://github.com/thib3113/ha-boks/blob/main/scripts/get_config_key.py) de l'intégration Home Assistant. Il va :
1. Se connecter à votre compte Boks via Google Identity.
2. Lister tous les appareils associés.
3. Afficher leur **ConfigKey** et leur **adresse MAC** respectives.

---

## Méthode 2 : Extraction Manuelle (Android)

Si vous ne pouvez pas utiliser l'API Cloud, vous pouvez extraire les clés de la base de données locale de l'application Android.

### 1. Localiser la base de données
L'application stocke ses données dans une base IndexedDB située à :
`/data/user/0/com.boks.app/app_webview/Default/IndexedDB/`

*Note : L'accès à ce chemin nécessite un **appareil rooté** ou l'utilisation d'outils de sauvegarde spécifiques au fabricant qui contournent la restriction `allowBackup=false`.*

### 2. Extraire la Clé
Comme les données sont souvent compressées par LevelDB, utilisez un outil comme **[dfindexeddb](https://github.com/google/dfindexeddb)** pour analyser les fichiers :

```bash
pip install dfindexeddb
dfindexeddb db -s /chemin/vers/dossier/IndexedDB/ --format chrome --use_manifest
```

Recherchez `"configurationKey"` ou `"masterKey"` dans la sortie JSON résultante.

---

## Méthode 3 : Extraction Manuelle (iOS)

Sur iOS, vous pouvez extraire les clés d'une sauvegarde locale **non chiffrée** de votre iPhone.

1. Créez une sauvegarde non chiffrée via **iMazing** ou iTunes.
2. Utilisez un explorateur de sauvegarde (comme iBackupBot) pour naviguer vers :
   `User App Files` > `com.boks.app` > `Library` > `WebKit` > `WebsiteData` > `Default` > `IndexedDB`.
3. Localisez le fichier `IndexedDB.sqlite3` et exportez-le.
4. Utilisez **dfindexeddb** pour l'analyser :
   ```bash
   dfindexeddb db -s IndexedDB.sqlite3 --format safari
   ```

---

## Pourquoi faire cet effort ?

Une fois que vous avez récupéré votre **Master Key** ou votre **ConfigKey**, vous gagnez une **indépendance totale** vis-à-vis de l'infrastructure Boks. Vous pouvez contrôler votre matériel directement via Bluetooth, générer vos propres codes de livraison, et garantir que votre boîte à colis reste fonctionnelle même si les services cloud officiels sont indisponibles.
