# Algorithme de Génération des Codes PIN Boks

Ce document détaille le fonctionnement de l'algorithme propriétaire utilisé par les boîtes à colis Boks pour dériver les codes PIN (Master, Single-use, Multi-use) à partir d'une clé secrète.

## 1. Spécifications Techniques

L'algorithme est une variante personnalisée de **BLAKE2s** qui utilise les constantes d'initialisation de **SHA-256** au lieu des constantes standards.

| Composante               | Description                                                           |
|:-------------------------|:----------------------------------------------------------------------|
| **Algorithme**           | BLAKE2s (Structure ARX, 10 rounds)                                    |
| **Vecteur Initial (IV)** | Constantes H de SHA-256 standard                                      |
| **Initialisation**       | `H[0]` XORé avec les métadonnées `[6, 32, 1, 1]`                      |
| **Séquence**             | 1. Traitement de la Clé (Bloc 1)<br>2. Traitement du Message (Bloc 2) |
| **Transformation PIN**   | Chaque octet du hash subit un **Modulo 12**                           |
| **Table de caractères**  | `0123456789AB`                                                        |

## 2. Implémentation Python de Référence

```python
import struct

# IV SHA-256 utilisé en remplacement de l'IV BLAKE2s
IV = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]

# Table de permutation Sigma standard
SIGMA = [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], [14,10,4,8,9,15,13,6,1,12,0,2,11,7,5,3], [11,8,12,0,5,2,15,13,10,14,3,6,7,1,9,4], [7,9,3,1,13,12,11,14,2,6,5,10,4,0,15,8], [9,0,5,7,2,4,10,15,14,1,11,12,6,8,3,13], [2,12,6,10,0,11,8,3,4,13,7,5,15,14,1,9], [12,5,1,15,14,13,4,10,0,7,6,3,9,2,8,11], [13,11,7,14,12,1,3,9,5,0,15,4,8,6,2,10], [6,15,14,9,11,3,0,8,12,2,13,7,1,4,10,5], [10,2,8,4,7,6,1,5,15,11,9,14,3,12,13,0]]

def G(v, a, b, c, d, x, y):
    v[a] = (v[a] + v[b] + x) & 0xFFFFFFFF
    v[d] = (((v[d] ^ v[a]) >> 16) | ((v[d] ^ v[a]) << 16)) & 0xFFFFFFFF
    v[c] = (v[c] + v[d]) & 0xFFFFFFFF
    v[b] = (((v[b] ^ v[c]) >> 12) | ((v[b] ^ v[c]) << 20)) & 0xFFFFFFFF
    v[a] = (v[a] + v[b] + y) & 0xFFFFFFFF
    v[d] = (((v[d] ^ v[a]) >> 8) | ((v[d] ^ v[a]) << 24)) & 0xFFFFFFFF
    v[c] = (v[c] + v[d]) & 0xFFFFFFFF
    v[b] = (((v[b] ^ v[c]) >> 7) | ((v[b] ^ v[c]) << 25)) & 0xFFFFFFFF

def compress(h, block, t0, f0):
    v = list(h) + list(IV)
    v[12] ^= t0
    v[14] ^= f0
    m = struct.unpack('<16I', block)
    for i in range(10):
        s = SIGMA[i]
        G(v, 0, 4, 8, 12, m[s[0]], m[s[1]]); G(v, 1, 5, 9, 13, m[s[2]], m[s[3]])
        G(v, 2, 6, 10, 14, m[s[4]], m[s[5]]); G(v, 3, 7, 11, 15, m[s[6]], m[s[7]])
        G(v, 0, 5, 10, 15, m[s[8]], m[s[9]]); G(v, 1, 6, 11, 12, m[s[10]], m[s[11]])
        G(v, 2, 7, 8, 13, m[s[12]], m[s[13]]); G(v, 3, 4, 9, 14, m[s[14]], m[s[15]])
    for i in range(8): h[i] ^= v[i] ^ v[i+8]
    return h

def generate_boks_pin(key_hex, type_prefix, index):
    """
    Paramètres :
    - key_hex : La Master Key de 32 octets (string hexadécimale de 64 caractères)
    - type_prefix : Le type de code. Valeurs possibles : 'master', 'single-use', 'multi-use'
    - index : L'index du code à générer (0, 1, 2, ...)
    """
    key = bytes.fromhex(key_hex)
    h = list(IV)
    
    # XOR initial avec les métadonnées [out_len=6, key_len=32, 1, 1]
    h[0] ^= 0x01012006 
    
    # Traitement du Bloc 1 : La Clé
    h = compress(h, key + b'\x00' * 32, 64, 0)
    
    # Traitement du Bloc 2 : Le Message (préfixe + espace + index)
    # Le firmware utilise vsnprintf pour construire ce message
    msg = f"{type_prefix} {index}".encode('utf-8')
    h = compress(h, msg + b'\x00' * (64 - len(msg)), 64 + len(msg), 0xFFFFFFFF)
    
    # Extraction des 6 premiers octets du hash (Little Endian)
    res = b"".join(struct.pack('<I', x) for x in h)[:6]
    
    # Conversion finale en caractères via Modulo 12
    # Table de substitution du clavier Boks
    return "".join("0123456789AB"[b % 12] for b in res)
```

