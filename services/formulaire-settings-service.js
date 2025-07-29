const axios = require('axios');

class FormulaireSettingsService {
    constructor() {
        this.baseURL = 'http://localhost:3000/v1/api/formulaire-settings';
        this.token = null;
    }

    // Setter pour le token d'authentification
    setToken(token) {
        this.token = token;
    }

    // Headers avec authentification
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    /**
     * Récupérer tous les paramètres d'un formulaire
     */
    async getSettings(formulaireId) {
        try {
            const response = await axios.get(`${this.baseURL}/${formulaireId}`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des paramètres:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Mettre à jour les paramètres généraux
     */
    async updateGeneralSettings(formulaireId, settings) {
        try {
            const response = await axios.put(`${this.baseURL}/${formulaireId}/general`, settings, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres généraux:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Mettre à jour les paramètres de notification
     */
    async updateNotificationSettings(formulaireId, settings) {
        try {
            const response = await axios.put(`${this.baseURL}/${formulaireId}/notifications`, settings, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres de notification:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Mettre à jour les paramètres de planification
     */
    async updateSchedulingSettings(formulaireId, settings) {
        try {
            const response = await axios.put(`${this.baseURL}/${formulaireId}/scheduling`, settings, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres de planification:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Mettre à jour les paramètres de localisation
     */
    async updateLocalizationSettings(formulaireId, settings) {
        try {
            const response = await axios.put(`${this.baseURL}/${formulaireId}/localization`, settings, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres de localisation:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Mettre à jour les paramètres de sécurité
     */
    async updateSecuritySettings(formulaireId, settings) {
        try {
            const response = await axios.put(`${this.baseURL}/${formulaireId}/security`, settings, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres de sécurité:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Mettre à jour tous les paramètres en une seule fois
     */
    async updateAllSettings(formulaireId, settings) {
        try {
            const response = await axios.put(`${this.baseURL}/${formulaireId}/all`, settings, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de tous les paramètres:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Réinitialiser les paramètres aux valeurs par défaut
     */
    async resetSettings(formulaireId) {
        try {
            const response = await axios.post(`${this.baseURL}/${formulaireId}/reset`, {}, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des paramètres:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = FormulaireSettingsService;
