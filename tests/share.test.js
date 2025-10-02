const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Share = require('../models/share-model');
const Formulaire = require('../models/formulaire');
const User = require('../models/user');

describe('Share API', () => {
  let authToken;
  let userId;
  let formulaireId;

  beforeAll(async () => {
    // Configuration de la base de données de test
    await mongoose.connect(process.env.MONGO_URL_TEST || 'mongodb://localhost:27017/test_formulaire_db');
    
    // Créer un utilisateur de test
    const user = new User({
      nom: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'sondeur'
    });
    await user.save();
    userId = user._id;

    // Créer un token JWT
    authToken = jwt.sign(
      { id_user: userId.toString() },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Créer un formulaire de test
    const formulaire = new Formulaire({
      titre: 'Formulaire de test',
      description: 'Description de test',
      admin: userId,
      champs: []
    });
    await formulaire.save();
    formulaireId = formulaire._id;
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await Share.deleteMany({});
    await Formulaire.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Nettoyer les liens de partage après chaque test
    await Share.deleteMany({});
  });

  describe('POST /v1/api/share/generate', () => {
    it('should generate a share link successfully', async () => {
      const response = await request(app)
        .post('/v1/api/share/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          formulaireId: formulaireId.toString(),
          requirePassword: false,
          isPublic: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('shareUrl');
      expect(response.body.data).toHaveProperty('shareId');
    });

    it('should generate a password-protected share link', async () => {
      const response = await request(app)
        .post('/v1/api/share/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          formulaireId: formulaireId.toString(),
          requirePassword: true,
          customPassword: 'testPassword123',
          isPublic: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.settings.requirePassword).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/v1/api/share/generate')
        .send({
          formulaireId: formulaireId.toString(),
          isPublic: true
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent formulaire', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post('/v1/api/share/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          formulaireId: fakeId.toString(),
          isPublic: true
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /v1/api/share/send-email', () => {
    let shareUrl;

    beforeEach(async () => {
      // Créer un lien de partage pour les tests
      const share = new Share({
        formulaireId,
        shareId: 'test-share-id',
        shareUrl: 'http://localhost:3000/share/test-share-id',
        createdBy: userId,
        settings: {
          requirePassword: false,
          isPublic: true
        }
      });
      await share.save();
      shareUrl = share.shareUrl;
    });

    it('should send email successfully', async () => {
      const response = await request(app)
        .post('/v1/api/share/send-email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          formulaireId: formulaireId.toString(),
          shareUrl: shareUrl,
          recipients: ['test@example.com'],
          subject: 'Test Subject',
          message: 'Test Message'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should validate email addresses', async () => {
      const response = await request(app)
        .post('/v1/api/share/send-email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          formulaireId: formulaireId.toString(),
          shareUrl: shareUrl,
          recipients: ['invalid-email'],
          subject: 'Test Subject',
          message: 'Test Message'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v1/api/share/schedule-email', () => {
    let shareUrl;

    beforeEach(async () => {
      const share = new Share({
        formulaireId,
        shareId: 'test-share-id-schedule',
        shareUrl: 'http://localhost:3000/share/test-share-id-schedule',
        createdBy: userId,
        settings: {
          requirePassword: false,
          isPublic: true
        }
      });
      await share.save();
      shareUrl = share.shareUrl;
    });

    it('should schedule email successfully', async () => {
      const scheduledDate = new Date(Date.now() + 3600000); // 1 hour from now
      
      const response = await request(app)
        .post('/v1/api/share/schedule-email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          formulaireId: formulaireId.toString(),
          shareUrl: shareUrl,
          recipients: ['test@example.com'],
          scheduledDate: scheduledDate.toISOString(),
          subject: 'Scheduled Test Subject',
          message: 'Scheduled Test Message'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject past scheduled date', async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      
      const response = await request(app)
        .post('/v1/api/share/schedule-email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          formulaireId: formulaireId.toString(),
          shareUrl: shareUrl,
          recipients: ['test@example.com'],
          scheduledDate: pastDate.toISOString(),
          subject: 'Test Subject',
          message: 'Test Message'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /v1/api/share/stats/:formulaireId', () => {
    beforeEach(async () => {
      // Créer quelques liens de partage pour les statistiques
      await Share.create([
        {
          formulaireId,
          shareId: 'stats-test-1',
          shareUrl: 'http://localhost:3000/share/stats-test-1',
          createdBy: userId,
          settings: { requirePassword: false, isPublic: true },
          stats: { views: 10, responses: 5, emailsSent: 3 }
        },
        {
          formulaireId,
          shareId: 'stats-test-2',
          shareUrl: 'http://localhost:3000/share/stats-test-2',
          createdBy: userId,
          settings: { requirePassword: false, isPublic: true },
          stats: { views: 15, responses: 8, emailsSent: 5 }
        }
      ]);
    });

    it('should return statistics successfully', async () => {
      const response = await request(app)
        .get(`/v1/api/share/stats/${formulaireId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalLinks');
      expect(response.body.data).toHaveProperty('totalViews');
      expect(response.body.data).toHaveProperty('totalResponses');
      expect(response.body.data).toHaveProperty('emailsSent');
      expect(response.body.data.totalLinks).toBe(2);
      expect(response.body.data.totalViews).toBe(25);
      expect(response.body.data.totalResponses).toBe(13);
      expect(response.body.data.emailsSent).toBe(8);
    });
  });

  describe('GET /v1/api/share/active/:formulaireId', () => {
    beforeEach(async () => {
      // Créer des liens actifs et inactifs
      await Share.create([
        {
          formulaireId,
          shareId: 'active-test-1',
          shareUrl: 'http://localhost:3000/share/active-test-1',
          createdBy: userId,
          settings: { requirePassword: false, isPublic: true },
          active: true
        },
        {
          formulaireId,
          shareId: 'active-test-2',
          shareUrl: 'http://localhost:3000/share/active-test-2',
          createdBy: userId,
          settings: { requirePassword: false, isPublic: true },
          active: false
        }
      ]);
    });

    it('should return only active links', async () => {
      const response = await request(app)
        .get(`/v1/api/share/active/${formulaireId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].shareId).toBe('active-test-1');
    });
  });

  describe('POST /v1/api/share/validate-password', () => {
    let shareId;

    beforeEach(async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('testPassword123', 10);
      
      const share = new Share({
        formulaireId,
        shareId: 'password-test-share',
        shareUrl: 'http://localhost:3000/share/password-test-share',
        createdBy: userId,
        settings: {
          requirePassword: true,
          password: hashedPassword,
          isPublic: true
        }
      });
      await share.save();
      shareId = share.shareId;
    });

    it('should validate correct password', async () => {
      const response = await request(app)
        .post('/v1/api/share/validate-password')
        .send({
          shareId: shareId,
          password: 'testPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/v1/api/share/validate-password')
        .send({
          shareId: shareId,
          password: 'wrongPassword'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(false);
    });
  });
});

// Tests pour les méthodes du modèle Share
describe('Share Model Methods', () => {
  let share;

  beforeEach(async () => {
    share = new Share({
      formulaireId: new mongoose.Types.ObjectId(),
      shareId: 'test-model-share',
      shareUrl: 'http://localhost:3000/share/test-model-share',
      createdBy: new mongoose.Types.ObjectId(),
      settings: {
        requirePassword: false,
        isPublic: true,
        expiryDate: new Date(Date.now() + 86400000), // 24 hours from now
        maxUses: 100
      },
      stats: {
        views: 50,
        responses: 10,
        emailsSent: 5
      }
    });
    await share.save();
  });

  afterEach(async () => {
    await Share.deleteMany({});
  });

  describe('isValid method', () => {
    it('should return true for valid share', () => {
      expect(share.isValid()).toBe(true);
    });

    it('should return false for inactive share', () => {
      share.active = false;
      expect(share.isValid()).toBe(false);
    });

    it('should return false for expired share', () => {
      share.settings.expiryDate = new Date(Date.now() - 86400000); // 24 hours ago
      expect(share.isValid()).toBe(false);
    });

    it('should return false for share with exceeded max uses', () => {
      share.settings.maxUses = 10;
      share.stats.views = 15;
      expect(share.isValid()).toBe(false);
    });
  });

  describe('incrementViews method', () => {
    it('should increment views count', async () => {
      const initialViews = share.stats.views;
      await share.incrementViews();
      
      expect(share.stats.views).toBe(initialViews + 1);
      expect(share.stats.lastAccessed).toBeDefined();
    });
  });

  describe('incrementResponses method', () => {
    it('should increment responses count', async () => {
      const initialResponses = share.stats.responses;
      await share.incrementResponses();
      
      expect(share.stats.responses).toBe(initialResponses + 1);
    });
  });

  describe('incrementEmailsSent method', () => {
    it('should increment emails sent count', async () => {
      const initialEmailsSent = share.stats.emailsSent;
      await share.incrementEmailsSent(3);
      
      expect(share.stats.emailsSent).toBe(initialEmailsSent + 3);
    });
  });
});
