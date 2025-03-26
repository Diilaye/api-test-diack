
const routes = new require('express').Router();

// Add routes
routes.get('/', require('../controllers/annee-academinque').all);
routes.get('/:id', require('../controllers/annee-academinque').one);
routes.post('/', require('../midleweares/auth').checkManyRole(['admin', 'agent']), require('../controllers/annee-academinque').store);
routes.post('/:id', require('../midleweares/auth').checkManyRole(['admin', 'agent']), require('../controllers/annee-academinque').update);
routes.delete('/:id', require('../midleweares/auth').checkManyRole(['admin', 'agent']), require('../controllers/annee-academinque').delete);

module.exports = routes;
