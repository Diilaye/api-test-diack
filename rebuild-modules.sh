#!/bin/bash

echo "🔧 Script de reconstruction des modules natifs pour le déploiement Linux"
echo "========================================================================="

# Supprimer node_modules et package-lock.json
echo "📦 Suppression des anciens modules..."
rm -rf node_modules
rm -f package-lock.json

# Réinstaller toutes les dépendances
echo "📥 Installation des dépendances..."
npm install

# Forcer la reconstruction des modules natifs (bcrypt, bcryptjs, etc.)
echo "🔨 Reconstruction des modules natifs..."
npm rebuild

# Spécifiquement pour bcrypt qui pose souvent problème
echo "🔐 Reconstruction spécifique de bcrypt..."
npm rebuild bcrypt --build-from-source

echo "✅ Reconstruction terminée ! Les modules sont maintenant compatibles avec l'architecture du serveur."
echo ""
echo "💡 Pour déployer :"
echo "   1. Copiez ce script sur le serveur"
echo "   2. Exécutez-le dans le dossier du projet : bash rebuild-modules.sh"
echo "   3. Redémarrez le service avec PM2"