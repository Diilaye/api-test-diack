# API de Partage de Formulaires

Cette API permet de créer, gérer et partager des formulaires avec des fonctionnalités avancées de sécurité et de programmation d'emails.

## Fonctionnalités

### 1. Génération de liens de partage
- Création de liens uniques pour chaque formulaire
- Protection par mot de passe optionnelle
- Date d'expiration configurable
- Limitation du nombre d'utilisations
- Statistiques de vues et réponses

### 2. Envoi d'emails
- Envoi immédiat à plusieurs destinataires
- Inclusion du mot de passe dans l'email (optionnel)
- Messages personnalisés
- Suivi des emails envoyés

### 3. Programmation d'emails
- Planification d'envois à des dates spécifiques
- Envois récurrents (quotidien, hebdomadaire, mensuel)
- Gestion des erreurs et reprises automatiques
- Annulation d'envois programmés

### 4. Sécurité
- Authentification JWT requise
- Validation des permissions utilisateur
- Hashage des mots de passe avec bcrypt
- Protection contre les accès non autorisés

## Endpoints API

### Routes protégées (authentification requise)

#### POST /v1/api/share/generate
Génère un nouveau lien de partage pour un formulaire.

**Body:**
```json
{
  "formulaireId": "string (MongoDB ObjectId)",
  "requirePassword": "boolean (optionnel)",
  "customPassword": "string (optionnel)",
  "expiryDate": "string ISO8601 (optionnel)",
  "maxUses": "number (optionnel)",
  "isPublic": "boolean (optionnel, défaut: true)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lien de partage généré avec succès",
  "data": {
    "shareId": "uuid",
    "shareUrl": "string",
    "settings": {
      "requirePassword": false,
      "isPublic": true,
      "expiryDate": null,
      "maxUses": null
    },
    "stats": {
      "views": 0,
      "responses": 0,
      "emailsSent": 0
    }
  }
}
```

#### POST /v1/api/share/send-email
Envoie le lien de partage par email.

**Body:**
```json
{
  "formulaireId": "string (MongoDB ObjectId)",
  "shareUrl": "string",
  "recipients": ["email1@example.com", "email2@example.com"],
  "subject": "string (optionnel)",
  "message": "string (optionnel)",
  "password": "string (optionnel)",
  "includePassword": "boolean (optionnel)"
}
```

#### POST /v1/api/share/schedule-email
Programme l'envoi d'emails.

**Body:**
```json
{
  "formulaireId": "string (MongoDB ObjectId)",
  "shareUrl": "string",
  "recipients": ["email1@example.com"],
  "scheduledDate": "string ISO8601",
  "subject": "string (optionnel)",
  "message": "string (optionnel)",
  "password": "string (optionnel)",
  "includePassword": "boolean (optionnel)",
  "recurring": "boolean (optionnel)",
  "recurringPattern": "string (daily|weekly|monthly, optionnel)"
}
```

#### GET /v1/api/share/stats/:formulaireId
Récupère les statistiques de partage d'un formulaire.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLinks": 5,
    "totalViews": 150,
    "totalResponses": 45,
    "emailsSent": 120
  }
}
```

#### GET /v1/api/share/active/:formulaireId
Récupère la liste des liens actifs d'un formulaire.

#### DELETE /v1/api/share/revoke/:shareId
Révoque un lien de partage.

### Routes publiques (sans authentification)

#### GET /v1/api/share/details/:shareId
Récupère les détails d'un lien de partage.

#### GET /v1/api/share/access/:shareId
Accède à un formulaire via un lien de partage.

#### POST /v1/api/share/validate-password
Valide le mot de passe d'un lien protégé.

**Body:**
```json
{
  "shareId": "string (UUID)",
  "password": "string"
}
```

## Modèles de données

### Share
```javascript
{
  formulaireId: ObjectId,
  shareId: String (UUID),
  shareUrl: String,
  createdBy: ObjectId,
  settings: {
    requirePassword: Boolean,
    password: String (hashé),
    isPublic: Boolean,
    expiryDate: Date,
    maxUses: Number
  },
  stats: {
    views: Number,
    responses: Number,
    emailsSent: Number,
    lastAccessed: Date
  },
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### ScheduledEmail
```javascript
{
  formulaireId: ObjectId,
  shareId: ObjectId,
  createdBy: ObjectId,
  recipients: [String],
  subject: String,
  message: String,
  shareUrl: String,
  password: String,
  includePassword: Boolean,
  scheduledDate: Date,
  recurring: Boolean,
  recurringPattern: String,
  nextScheduledDate: Date,
  status: String (pending|sent|failed|cancelled),
  sentAt: Date,
  errorMessage: String,
  emailsSent: Number,
  totalRecipients: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Configuration

### Variables d'environnement
```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# URL du frontend
FRONTEND_URL=http://localhost:3000

# Configuration des liens de partage
SHARE_LINK_EXPIRES_DAYS=30
SHARE_MAX_USES_DEFAULT=1000

# Configuration des emails programmés
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=5000
EMAIL_BATCH_SIZE=50
```

### Dépendances requises
```bash
npm install node-cron nodemailer bcrypt crypto
```

## Utilisation côté frontend

### Service ShareService
```dart
final shareService = ShareService();

// Générer un lien
final result = await shareService.generateShareLink(
  formulaireId,
  requirePassword: true,
  customPassword: 'monMotDePasse123',
  expiryDate: DateTime.now().add(Duration(days: 7)),
);

// Envoyer par email
await shareService.sendEmailShare(
  formulaireId: formulaireId,
  shareUrl: result['shareUrl'],
  recipients: ['user@example.com'],
  subject: 'Invitation à remplir le formulaire',
  includePassword: true,
);
```

### Widget ShareButton
```dart
ShareButton(
  formulaire: formulaire,
  onShareCompleted: () {
    // Callback après partage
    _loadFormulaires();
  },
)
```

## Sécurité

1. **Authentification**: Toutes les routes de gestion nécessitent une authentification JWT
2. **Permissions**: Vérification que l'utilisateur est propriétaire du formulaire
3. **Validation**: Validation stricte des données d'entrée
4. **Hashage**: Mots de passe hashés avec bcrypt
5. **Expiration**: Liens avec dates d'expiration configurables
6. **Limitation**: Nombre maximal d'utilisations par lien

## Gestion des erreurs

L'API retourne des codes d'erreur HTTP appropriés :
- 400: Données invalides
- 401: Non authentifié
- 403: Accès refusé
- 404: Ressource non trouvée
- 410: Lien expiré
- 500: Erreur serveur

## Logs et monitoring

Le système inclut des logs détaillés pour :
- Génération de liens
- Envois d'emails
- Accès aux formulaires
- Erreurs et échecs

## Déploiement

1. Configurer les variables d'environnement
2. Installer les dépendances
3. Démarrer le service de planification
4. Tester les endpoints avec des outils comme Postman
5. Vérifier la configuration SMTP

## Support et maintenance

- Nettoyage automatique des liens expirés
- Archivage des emails envoyés
- Statistiques détaillées
- Système de retry pour les emails échoués
