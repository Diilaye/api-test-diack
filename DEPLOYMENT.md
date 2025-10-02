# Instructions de déploiement pour api-test-diack

## ✅ Problème résolu : Erreur bcrypt "invalid ELF header"

Cette erreur se produit quand les modules natifs (comme bcrypt) sont compilés sur une architecture (macOS) et utilisés sur une autre (Linux).

## ✅ Problème résolu : CORS configuré

La configuration CORS est maintenant correcte pour les domaines de production.

## 🚀 Solution complète de déploiement

### Étape 1 : Mise à jour du code
```bash
# Sur le serveur
cd /home/app/api-test-diack
git pull origin main
```

### Étape 2 : Résolution modules natifs
```bash
# Supprimer les anciens modules
rm -rf node_modules package-lock.json

# Réinstaller proprement
npm install

# Vérifier qu'il n'y a pas de bcrypt natif
npm list bcrypt  # Devrait être vide
npm list bcryptjs  # Devrait afficher bcryptjs@2.4.3
```

### Étape 3 : Redémarrer l'application
```bash
pm2 restart api-test-diag
```

### Étape 4 : Vérifier les logs
```bash
pm2 logs api-test-diag
```

## 🧪 Tests de vérification

### Test 1 : Serveur répond
```bash
curl -I https://api-test-diag.saharux.com/v1/api/users/auth
# Devrait retourner 404 (pas 503), avec headers Express
```

### Test 2 : CORS fonctionne
```bash
curl -X OPTIONS -I https://api-test-diag.saharux.com/v1/api/users/auth \
  -H "Origin: https://test-diag.saharux.com"
# Devrait retourner 204 avec Access-Control-Allow-Origin
```

### Test 3 : Route stats fonctionne
```bash
curl -I https://api-test-diag.saharux.com/v1/api/stats/general
# Devrait retourner 401 (Unauthorized) ou 200, pas 404
```

## 🎯 Résultat attendu

Après le déploiement :
- ✅ Serveur démarre sans erreur bcrypt
- ✅ CORS autorise https://test-diag.saharux.com
- ✅ Route /stats/general existe
- ✅ Authentification fonctionne depuis le frontend
- ✅ AdminApiService peut récupérer les statistiques

## 📝 Notes importantes

- Le code utilise exclusivement `bcryptjs` (pas de compilation native)
- Configuration CORS spécifique aux domaines saharux.com
- Nouvelle route `/stats/general` pour AdminApiService
- Support complet des credentials et headers d'authentification