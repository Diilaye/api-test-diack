# Instructions de déploiement pour api-test-diack

## Problème résolu : Erreur bcrypt "invalid ELF header"

Cette erreur se produit quand les modules natifs (comme bcrypt) sont compilés sur une architecture (macOS) et utilisés sur une autre (Linux).

## Solution sur le serveur de production

### Méthode 1 : Script automatique (recommandé)
```bash
# Sur le serveur
cd /path/to/api-test-diack
bash rebuild-modules.sh
pm2 restart api-test-diag
```

### Méthode 2 : Commandes manuelles
```bash
# Sur le serveur
cd /path/to/api-test-diack
rm -rf node_modules package-lock.json
npm install
npm rebuild
npm rebuild bcrypt --build-from-source
pm2 restart api-test-diag
```

### Méthode 3 : Alternative avec bcryptjs (plus portable)
Si le problème persiste, remplacer bcrypt par bcryptjs dans le code :

```javascript
// Remplacer
const bcrypt = require('bcrypt');

// Par
const bcrypt = require('bcryptjs');
```

## Déploiement futur

Pour éviter ce problème à l'avenir :
1. Ne jamais copier node_modules entre systèmes différents
2. Toujours faire `npm install` sur le serveur cible
3. Utiliser `npm ci` pour les déploiements production
4. Considérer Docker pour une meilleure portabilité

## Vérification

Après résolution, tester :
```bash
curl -I https://api-test-diag.saharux.com/v1/api/users
```

Devrait retourner 200 ou 405, pas 503.