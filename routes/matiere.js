
const routes = new require('express').Router();

// Add routes
routes.get('/', require('../controllers/matiere').all);
routes.get('/:id', require('../controllers/matiere').one);
routes.post('/', require('../midleweares/auth').checkManyRole(['admin', 'agent']), require('../controllers/matiere').store);
routes.put('/:id', require('../midleweares/auth').checkManyRole(['admin', 'agent']), require('../controllers/matiere').update);
routes.delete('/:id', require('../midleweares/auth').checkManyRole(['admin', 'agent']), require('../controllers/matiere').delete);

module.exports = routes;
