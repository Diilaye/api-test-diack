
const routes = new require('express').Router();

// Add routes
routes.get('/', require('../controllers/user').all);
routes.post('/', require('../controllers/user').store);
routes.post('/auth', require('../controllers/user').auth);
routes.post('/auth/sonde', require('../controllers/user').authsonde);
routes.get('/auth', require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']), require('../controllers/user').getAuth);
routes.put('/:id', require('../controllers/user').update);
routes.get('/:id', require('../controllers/user').one);

routes.delete('/:id', require('../controllers/user').delete);

module.exports = routes;
