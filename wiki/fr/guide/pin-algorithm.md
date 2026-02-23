# Algorithme de Génération de PIN

L'écosystème Boks utilise un algorithme de dérivation personnalisé pour générer des codes PIN alphanumériques de 6 caractères à partir d'une **Master Key** de 32 octets. Cela permet au serveur, au smartphone et au matériel de rester synchronisés sans jamais échanger les codes PIN réels sur les ondes.

## Aperçu Théorique

L'algorithme est basé sur un hash **SHA-256** modifié (ou BLAKE2s dans certaines implémentations) avec un vecteur d'initialisation personnalisé et un mappage final des caractères.

### 1. Initialisation du Hash
Au lieu de l'IV SHA-256 standard, l'algorithme utilise une constante spécifique pour XORer l'état initial :
- **Modificateur** : `0x01012006`

### 2. Format du Message
Le message haché dépend du type de code et de son index :
- **Format** : `"{type} {index}"`
- **Exemple** : `"single-use 42"` ou `"master 0"`

### 3. Mappage des Caractères
Le hash résultant n'est pas utilisé directement. Les 6 premiers octets sont extraits et mappés vers un jeu de 12 caractères :

**Charset** : `0 1 2 3 4 5 6 7 8 9 A B`

Chaque octet est converti en un index via un modulo 12 :
`char = Charset[octet % 12]`

## Détails d'Implémentation

Le SDK fournit une implémentation haute performance de cet algorithme dans `src/crypto/pin-algorithm.ts`. Elle utilise des tampons partagés pour minimiser les allocations mémoire, ce qui la rend adaptée aux appareils basse consommation ou à une génération haute fréquence (ex: générer les 3000 codes dans le simulateur).

## Pourquoi cet algorithme ?
- **Sync Hors-ligne** : Un appareil Boks n'a pas besoin de Wi-Fi pour savoir si un code est valide.
- **Sécurité** : Connaître un PIN ne permet pas de découvrir la Master Key.
- **Déterminisme** : Le même tuple (Clé, Type, Index) produira toujours le même PIN.
