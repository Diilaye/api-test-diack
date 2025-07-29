# API Documentation - Paramètres de Formulaire

## Vue d'ensemble
Cette API permet de gérer les paramètres des formulaires, incluant les paramètres généraux, les notifications, la planification, la localisation et la sécurité.

## Base URL
```
http://localhost:3000/v1/api/formulaire-settings
```

## Authentification
Toutes les routes nécessitent une authentification JWT via le header `Authorization: Bearer <token>`.

## Endpoints

### 1. Récupérer les paramètres d'un formulaire

**GET** `/v1/api/formulaire-settings/:id`

#### Paramètres
- `id` (string) - ID du formulaire

#### Réponse
```json
{
  "success": true,
  "data": {
    "general": {
      "connectionRequired": false,
      "autoSave": true,
      "publicForm": false,
      "limitResponses": false,
      "maxResponses": 100,
      "anonymousResponses": false
    },
    "notifications": {
      "enabled": true,
      "emailNotifications": true,
      "dailySummary": false
    },
    "scheduling": {
      "startDate": null,
      "endDate": null,
      "timezone": "Europe/Paris"
    },
    "localization": {
      "language": "fr",
      "timezone": "Europe/Paris"
    },
    "security": {
      "dataEncryption": true,
      "anonymousResponses": false
    }
  }
}
```

### 2. Mettre à jour les paramètres généraux

**PUT** `/v1/api/formulaire-settings/:id/general`

#### Body
```json
{
  "connectionRequired": true,
  "autoSave": true,
  "publicForm": false,
  "limitResponses": true,
  "maxResponses": 50,
  "anonymousResponses": false
}
```

#### Validation
- `connectionRequired`: Boolean
- `autoSave`: Boolean
- `publicForm`: Boolean
- `limitResponses`: Boolean
- `maxResponses`: Integer (1-10000)
- `anonymousResponses`: Boolean

### 3. Mettre à jour les paramètres de notification

**PUT** `/v1/api/formulaire-settings/:id/notifications`

#### Body
```json
{
  "enabled": true,
  "emailNotifications": true,
  "dailySummary": false
}
```

#### Validation
- `enabled`: Boolean
- `emailNotifications`: Boolean
- `dailySummary`: Boolean

### 4. Mettre à jour les paramètres de planification

**PUT** `/v1/api/formulaire-settings/:id/scheduling`

#### Body
```json
{
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.000Z",
  "timezone": "Europe/Paris"
}
```

#### Validation
- `startDate`: ISO 8601 date string ou null
- `endDate`: ISO 8601 date string ou null
- `timezone`: String

#### Contraintes
- `endDate` doit être postérieure à `startDate`

### 5. Mettre à jour les paramètres de localisation

**PUT** `/v1/api/formulaire-settings/:id/localization`

#### Body
```json
{
  "language": "fr",
  "timezone": "Europe/Paris"
}
```

#### Validation
- `language`: String ("fr", "en", "es")
- `timezone`: String

### 6. Mettre à jour les paramètres de sécurité

**PUT** `/v1/api/formulaire-settings/:id/security`

#### Body
```json
{
  "dataEncryption": true,
  "anonymousResponses": false
}
```

#### Validation
- `dataEncryption`: Boolean
- `anonymousResponses`: Boolean

### 7. Mettre à jour tous les paramètres

**PUT** `/v1/api/formulaire-settings/:id/all`

#### Body
```json
{
  "general": {
    "connectionRequired": false,
    "autoSave": true,
    "publicForm": true,
    "limitResponses": false,
    "maxResponses": 100,
    "anonymousResponses": true
  },
  "notifications": {
    "enabled": true,
    "emailNotifications": false,
    "dailySummary": false
  },
  "scheduling": {
    "startDate": "2025-07-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.000Z",
    "timezone": "Europe/Paris"
  },
  "localization": {
    "language": "en",
    "timezone": "America/New_York"
  },
  "security": {
    "dataEncryption": true,
    "anonymousResponses": false
  }
}
```

### 8. Réinitialiser les paramètres

**POST** `/v1/api/formulaire-settings/:id/reset`

#### Réponse
```json
{
  "success": true,
  "message": "Paramètres réinitialisés aux valeurs par défaut",
  "data": {
    // Paramètres par défaut
  }
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Formulaire non trouvé |
| 500 | Erreur serveur |

## Exemple d'utilisation avec curl

```bash
# Récupérer les paramètres
curl -X GET "http://localhost:3000/v1/api/formulaire-settings/FORMULAIRE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mettre à jour les paramètres généraux
curl -X PUT "http://localhost:3000/v1/api/formulaire-settings/FORMULAIRE_ID/general" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "connectionRequired": true,
    "publicForm": false,
    "limitResponses": true,
    "maxResponses": 50
  }'

# Réinitialiser les paramètres
curl -X POST "http://localhost:3000/v1/api/formulaire-settings/FORMULAIRE_ID/reset" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Middleware de vérification

Les paramètres sont automatiquement vérifiés lors de la soumission de réponses via le middleware `checkFormulaireSettings` qui :

1. Vérifie si une connexion est requise
2. Contrôle l'accès public
3. Valide les dates de planification
4. Contrôle les limites de réponses
5. Applique les paramètres de sécurité

## Intégration Frontend

Le service `FormulaireSettingsService` fourni permet une intégration facile avec le frontend :

```javascript
const service = new FormulaireSettingsService();
service.setToken(userToken);

// Récupérer les paramètres
const settings = await service.getSettings(formulaireId);

// Mettre à jour les paramètres généraux
await service.updateGeneralSettings(formulaireId, {
  connectionRequired: true,
  publicForm: false
});
```
