#!/bin/bash

# Script de déploiement pour résoudre le problème bcrypt
echo "🚀 Début du déploiement..."

# Sauvegarder le fichier .env s'il existe
if [ -f .env ]; then
    echo "📁 Sauvegarde du fichier .env..."
    cp .env .env.backup
fi

# Supprimer node_modules pour éviter les conflits d'architecture
echo "🧹 Suppression des anciens node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Installer uniquement bcryptjs (pas bcrypt)
echo "📦 Installation des dépendances..."
npm install

# Restaurer le .env si nécessaire
if [ -f .env.backup ]; then
    echo "🔄 Restauration du fichier .env..."
    cp .env.backup .env
    rm .env.backup
fi

# Vérifier que bcrypt n'est pas installé
if npm list bcrypt 2>/dev/null; then
    echo "⚠️  Suppression de bcrypt..."
    npm uninstall bcrypt
fi

# Redémarrer l'application avec PM2
echo "🔄 Redémarrage de l'application..."
pm2 restart api-test-diag || pm2 start app.js --name api-test-diag

echo "✅ Déploiement terminé!"