const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:4013/v1/api';
const FORMULAIRE_ID = '6749ecb7a9f8031b51a24b38'; // Remplacez par un ID valide
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDllY2EwYTlmODAzMWI1MWEyNGIzNSIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiaWF0IjoxNzMzMDE5ODM5fQ.FP4xOGZRJ9FfhDcNRNGSjWqZQdTRDCvYkVrRQqcFj8s'; // Remplacez par un token valide

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
};

async function testFormulaireSettings() {
    try {
        console.log('🧪 Test des paramètres de formulaire...\n');

        // 1. Test récupération des paramètres
        console.log('1. Récupération des paramètres...');
        try {
            const response = await axios.get(`${BASE_URL}/formulaire-settings/${FORMULAIRE_ID}`, { headers });
            console.log('✅ Paramètres récupérés:', response.data);
        } catch (error) {
            console.log('❌ Erreur récupération:', error.response?.data || error.message);
        }

        // 2. Test mise à jour paramètres généraux
        console.log('\n2. Mise à jour des paramètres généraux...');
        try {
            const generalData = {
                connectionRequired: true,
                publicForm: false,
                limitResponses: true,
                maxResponses: 50
            };
            const response = await axios.put(`${BASE_URL}/formulaire-settings/${FORMULAIRE_ID}/general`, generalData, { headers });
            console.log('✅ Paramètres généraux mis à jour:', response.data);
        } catch (error) {
            console.log('❌ Erreur mise à jour générale:', error.response?.data || error.message);
        }

        // 3. Test mise à jour paramètres de notification
        console.log('\n3. Mise à jour des paramètres de notification...');
        try {
            const notificationData = {
                enabled: true,
                emailNotifications: true,
                dailySummary: false
            };
            const response = await axios.put(`${BASE_URL}/formulaire-settings/${FORMULAIRE_ID}/notifications`, notificationData, { headers });
            console.log('✅ Paramètres de notification mis à jour:', response.data);
        } catch (error) {
            console.log('❌ Erreur mise à jour notification:', error.response?.data || error.message);
        }

        // 4. Test mise à jour paramètres de planification
        console.log('\n4. Mise à jour des paramètres de planification...');
        try {
            const schedulingData = {
                startDate: '2025-01-01T00:00:00.000Z',
                endDate: '2025-12-31T23:59:59.000Z',
                timezone: 'Europe/Paris'
            };
            const response = await axios.put(`${BASE_URL}/formulaire-settings/${FORMULAIRE_ID}/scheduling`, schedulingData, { headers });
            console.log('✅ Paramètres de planification mis à jour:', response.data);
        } catch (error) {
            console.log('❌ Erreur mise à jour planification:', error.response?.data || error.message);
        }

        // 5. Test mise à jour paramètres de localisation
        console.log('\n5. Mise à jour des paramètres de localisation...');
        try {
            const localizationData = {
                language: 'fr',
                timezone: 'Europe/Paris'
            };
            const response = await axios.put(`${BASE_URL}/formulaire-settings/${FORMULAIRE_ID}/localization`, localizationData, { headers });
            console.log('✅ Paramètres de localisation mis à jour:', response.data);
        } catch (error) {
            console.log('❌ Erreur mise à jour localisation:', error.response?.data || error.message);
        }

        // 6. Test mise à jour paramètres de sécurité
        console.log('\n6. Mise à jour des paramètres de sécurité...');
        try {
            const securityData = {
                dataEncryption: true,
                anonymousResponses: false
            };
            const response = await axios.put(`${BASE_URL}/formulaire-settings/${FORMULAIRE_ID}/security`, securityData, { headers });
            console.log('✅ Paramètres de sécurité mis à jour:', response.data);
        } catch (error) {
            console.log('❌ Erreur mise à jour sécurité:', error.response?.data || error.message);
        }

        // 7. Test récupération finale des paramètres
        console.log('\n7. Vérification finale des paramètres...');
        try {
            const response = await axios.get(`${BASE_URL}/formulaire-settings/${FORMULAIRE_ID}`, { headers });
            console.log('✅ Paramètres finaux:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Erreur vérification finale:', error.response?.data || error.message);
        }

        console.log('\n🎉 Tests terminés !');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

// Fonction pour tester la liste des formulaires
async function testFormulaires() {
    try {
        console.log('\n📋 Test de la liste des formulaires...');
        const response = await axios.get(`${BASE_URL}/formulaires`, { headers });
        console.log('✅ Formulaires trouvés:', response.data.data?.length || 0);
        
        if (response.data.data && response.data.data.length > 0) {
            console.log('Premier formulaire ID:', response.data.data[0].id);
            console.log('Titre:', response.data.data[0].titre);
        }
    } catch (error) {
        console.log('❌ Erreur récupération formulaires:', error.response?.data || error.message);
    }
}

// Exécution des tests
async function runTests() {
    console.log('🚀 Démarrage des tests des paramètres de formulaire\n');
    
    // Tester d'abord la connexion
    try {
        await axios.get(`${BASE_URL}/formulaires`, { headers });
        console.log('✅ Connexion API réussie\n');
    } catch (error) {
        console.log('❌ Erreur de connexion API:', error.response?.data || error.message);
        console.log('Vérifiez que le serveur est démarré et que le token est valide\n');
    }
    
    await testFormulaires();
    await testFormulaireSettings();
}

runTests();
