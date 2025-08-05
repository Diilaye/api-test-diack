
#!/bin/bash

# Script de démarrage pour l'API de partage de formulaires

echo "🚀 Démarrage de l'API de partage de formulaires..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si MongoDB est en cours d'exécution
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB ne semble pas être en cours d'exécution."
    echo "   Veuillez démarrer MongoDB avant de continuer."
    echo "   Commande: sudo systemctl start mongod (Linux) ou brew services start mongodb-community (macOS)"
fi

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "⚠️  Le fichier .env n'existe pas."
    echo "   Copiez .env.example vers .env et configurez les variables d'environnement."
    echo "   Commande: cp .env.example .env"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier les dépendances critiques
echo "🔍 Vérification des dépendances..."
npm ls node-cron nodemailer bcrypt mongoose express > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  Certaines dépendances manquent. Installation en cours..."
    npm install
fi

# Démarrer le serveur
echo "🌟 Démarrage du serveur..."
echo "   - Port: ${PORT:-4013}"
# Définit NODE_ENV à "development" si non défini
NODE_ENV="${NODE_ENV:-development}"
echo "   - Environnement: ${NODE_ENV}"
echo "   - MongoDB: ${MONGO_URL_DEV:-mongodb://localhost:27017/form}"

# Lancer le serveur
if [ "$NODE_ENV" = "development" ]; then
    # Mode développement avec nodemon si disponible
    if command -v nodemon &> /dev/null; then
        echo "🔄 Mode développement avec nodemon"
        nodemon app.js
    else
        echo "🔄 Mode développement sans nodemon"
        node app.js
    fi
else
    # Mode production
    echo "🚀 Mode production"
    node app.js
fi