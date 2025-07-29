const FormulaireSettingsService = require('./services/formulaire-settings-service');

// Test des paramètres de formulaire
async function testFormulaireSettings() {
    const service = new FormulaireSettingsService();
    
    // TODO: Remplacez par un vrai token JWT et un vrai ID de formulaire
    const token = 'votre-token-jwt-ici';
    const formulaireId = 'votre-formulaire-id-ici';
    
    service.setToken(token);

    try {
        console.log('=== Test des Paramètres de Formulaire ===\n');

        // 1. Récupération des paramètres
        console.log('1. Récupération des paramètres...');
        const settings = await service.getSettings(formulaireId);
        console.log('✅ Paramètres récupérés:', JSON.stringify(settings, null, 2));

        // 2. Mise à jour des paramètres généraux
        console.log('\n2. Mise à jour des paramètres généraux...');
        const generalSettings = {
            connectionRequired: true,
            autoSave: true,
            publicForm: false,
            limitResponses: true,
            maxResponses: 50,
            anonymousResponses: false
        };
        const updatedGeneral = await service.updateGeneralSettings(formulaireId, generalSettings);
        console.log('✅ Paramètres généraux mis à jour:', JSON.stringify(updatedGeneral, null, 2));

        // 3. Mise à jour des paramètres de notification
        console.log('\n3. Mise à jour des paramètres de notification...');
        const notificationSettings = {
            enabled: true,
            emailNotifications: true,
            dailySummary: true
        };
        const updatedNotifications = await service.updateNotificationSettings(formulaireId, notificationSettings);
        console.log('✅ Paramètres de notification mis à jour:', JSON.stringify(updatedNotifications, null, 2));

        // 4. Mise à jour des paramètres de planification
        console.log('\n4. Mise à jour des paramètres de planification...');
        const schedulingSettings = {
            startDate: '2025-01-01T00:00:00.000Z',
            endDate: '2025-12-31T23:59:59.000Z',
            timezone: 'Europe/Paris'
        };
        const updatedScheduling = await service.updateSchedulingSettings(formulaireId, schedulingSettings);
        console.log('✅ Paramètres de planification mis à jour:', JSON.stringify(updatedScheduling, null, 2));

        // 5. Mise à jour des paramètres de localisation
        console.log('\n5. Mise à jour des paramètres de localisation...');
        const localizationSettings = {
            language: 'fr',
            timezone: 'Europe/Paris'
        };
        const updatedLocalization = await service.updateLocalizationSettings(formulaireId, localizationSettings);
        console.log('✅ Paramètres de localisation mis à jour:', JSON.stringify(updatedLocalization, null, 2));

        // 6. Mise à jour des paramètres de sécurité
        console.log('\n6. Mise à jour des paramètres de sécurité...');
        const securitySettings = {
            dataEncryption: true,
            anonymousResponses: true
        };
        const updatedSecurity = await service.updateSecuritySettings(formulaireId, securitySettings);
        console.log('✅ Paramètres de sécurité mis à jour:', JSON.stringify(updatedSecurity, null, 2));

        // 7. Mise à jour de tous les paramètres en une fois
        console.log('\n7. Mise à jour de tous les paramètres en une fois...');
        const allSettings = {
            general: {
                connectionRequired: false,
                autoSave: true,
                publicForm: true,
                limitResponses: false,
                maxResponses: 100,
                anonymousResponses: true
            },
            notifications: {
                enabled: true,
                emailNotifications: false,
                dailySummary: false
            },
            scheduling: {
                startDate: '2025-07-01T00:00:00.000Z',
                endDate: '2025-12-31T23:59:59.000Z',
                timezone: 'Europe/Paris'
            },
            localization: {
                language: 'en',
                timezone: 'America/New_York'
            },
            security: {
                dataEncryption: true,
                anonymousResponses: false
            }
        };
        const updatedAll = await service.updateAllSettings(formulaireId, allSettings);
        console.log('✅ Tous les paramètres mis à jour:', JSON.stringify(updatedAll, null, 2));

        // 8. Vérification finale
        console.log('\n8. Vérification finale des paramètres...');
        const finalSettings = await service.getSettings(formulaireId);
        console.log('✅ Paramètres finaux:', JSON.stringify(finalSettings, null, 2));

        // 9. Test de réinitialisation
        console.log('\n9. Test de réinitialisation...');
        const resetSettings = await service.resetSettings(formulaireId);
        console.log('✅ Paramètres réinitialisés:', JSON.stringify(resetSettings, null, 2));

        console.log('\n🎉 Tous les tests sont passés avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        if (error.response) {
            console.error('Détails de l\'erreur:', error.response.data);
        }
    }
}

// Fonction pour tester avec des données d'exemple
async function testWithSampleData() {
    console.log('=== Test avec des données d\'exemple ===\n');
    
    console.log('Pour tester les nouvelles fonctionnalités:');
    console.log('1. Assurez-vous que le serveur est démarré');
    console.log('2. Remplacez "votre-token-jwt-ici" par un vrai token JWT');
    console.log('3. Remplacez "votre-formulaire-id-ici" par un vrai ID de formulaire');
    console.log('4. Exécutez: node test-formulaire-settings.js');
    
    console.log('\n📋 Endpoints disponibles:');
    console.log('GET    /v1/api/formulaire-settings/:id');
    console.log('PUT    /v1/api/formulaire-settings/:id/general');
    console.log('PUT    /v1/api/formulaire-settings/:id/notifications');
    console.log('PUT    /v1/api/formulaire-settings/:id/scheduling');
    console.log('PUT    /v1/api/formulaire-settings/:id/localization');
    console.log('PUT    /v1/api/formulaire-settings/:id/security');
    console.log('PUT    /v1/api/formulaire-settings/:id/all');
    console.log('POST   /v1/api/formulaire-settings/:id/reset');
    
    console.log('\n📋 Structure des paramètres:');
    console.log(JSON.stringify({
        general: {
            connectionRequired: false,
            autoSave: true,
            publicForm: false,
            limitResponses: false,
            maxResponses: 100,
            anonymousResponses: false
        },
        notifications: {
            enabled: true,
            emailNotifications: true,
            dailySummary: false
        },
        scheduling: {
            startDate: null,
            endDate: null,
            timezone: 'Europe/Paris'
        },
        localization: {
            language: 'fr',
            timezone: 'Europe/Paris'
        },
        security: {
            dataEncryption: true,
            anonymousResponses: false
        }
    }, null, 2));
}

// Exécution des tests
if (require.main === module) {
    testWithSampleData();
}

module.exports = { testFormulaireSettings, testWithSampleData };
