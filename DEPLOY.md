# Instructions de déploiement pour résoudre l'erreur bcrypt

## Problème
L'erreur `invalid ELF header` indique que les modules natifs (`bcrypt`) ont été compilés pour une architecture différente.

## Solution rapide (sur le serveur)

### 1. Aller dans le répertoire de l'application
```bash
cd /home/app/api-test-diack
```

### 2. Supprimer complètement node_modules et package-lock.json
```bash
rm -rf node_modules
rm -f package-lock.json
```

### 3. Réinstaller uniquement les dépendances du package.json
```bash
npm install
```

### 4. Vérifier que bcrypt n'est pas installé (optionnel)
```bash
npm list bcrypt
# Devrait retourner une erreur ou rien
```

### 5. Vérifier que bcryptjs est installé
```bash
npm list bcryptjs
# Devrait afficher bcryptjs@2.4.3
```

### 6. Redémarrer l'application
```bash
pm2 restart api-test-diag
```

### 7. Vérifier les logs
```bash
pm2 logs api-test-diag
```

## Vérification
- L'application devrait démarrer sans erreur
- L'endpoint https://api-test-diag.saharux.com/v1/api/users/auth devrait répondre
- Le problème CORS devrait être résolu

## Note
Notre code utilise exclusivement `bcryptjs` (version pure JavaScript) qui ne nécessite pas de compilation native, contrairement à `bcrypt`.