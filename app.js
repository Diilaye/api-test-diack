const app = require('express')();

require('dotenv').config({
    path: './.env'
});

// Configuration CORS améliorée pour la production
const cors = require('cors');

// Configuration CORS spécifique pour les domaines de production
const corsOptions = {
    origin: function (origin, callback) {
        // Permettre les requêtes sans origin (ex: mobile apps, Postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://test-diag.saharux.com',
            'https://api-test-diag.saharux.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:4013',
            'http://127.0.0.1:4013'
        ];
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.log(`CORS: Origin ${origin} not allowed`);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400 // 24 heures
};

app.use(cors(corsOptions));

// Gérer manuellement les requêtes OPTIONS pour s'assurer que CORS fonctionne
app.options('*', cors(corsOptions));

app.use(require('body-parser').json({
    limit: '10000mb'
}));

app.use(require('body-parser').urlencoded({
    extended: true,
    limit: '10000mb'
}));

app.use('/swaped-file', require('express').static('uploads'));

app.use('/v1/api/files', require('./routes/file'));
app.use('/v1/api/champs', require('./routes/champ'));
app.use('/v1/api/matieres', require('./routes/matiere'));
app.use('/v1/api/fabriques', require('./routes/fabrique'));
app.use('/v1/api/matieres', require('./routes/matiere'));
app.use('/v1/api/niveau-academiques', require('./routes/niveau-academique'));
app.use('/v1/api/annee-academinques', require('./routes/annee-academinque'));
app.use('/v1/api/formulaires', require('./routes/formaulaire-route'));
app.use('/v1/api/formulaires-reponses', require('./routes/response-formulaire-route'));
app.use('/v1/api/reponses', require('./routes/reponse')); // Nouvelle route pour les réponses
app.use('/v1/api/folders', require('./routes/folder-route'));
app.use('/v1/api/users', require('./routes/user'));
app.use('/v1/api/formulaire-settings', require('./routes/formulaire-settings-route')); // Nouvelle route pour les paramètres
app.use('/v1/api/share', require('./routes/share-routes')); // Nouvelle route pour le partage
app.use('/v1/api/export', require('./routes/export-routes')); // Nouvelle route pour l'export CSV
app.use('/v1/api/activities', require('./routes/activity-routes')); // Nouvelle route pour les activités
app.use('/v1/api/modern-users', require('./routes/modern-user-routes')); // Nouvelle route pour la gestion moderne des utilisateurs
app.use('/v1/api/stats', require('./routes/stats-routes')); // Nouvelle route pour les statistiques


app.get('/', (req, res) => {
    res.send('ici la terre');
})

require('./configs/db')().then(_ => {
    // Initialiser le service de planification d'emails
    require('./services/email-scheduler-service');
    
    const port = process.env.PORT
    app.listen(port, () => {

        process.env.NODE_ENV === "development"
            ? console.log("MongoDB URL for Development: ", process.env.MONGO_URL_DEV)
            : console.log("MongoDB URI: ", process.env.MONGO_URI);
        console.log(`Server started on ${port}`);
    });
});