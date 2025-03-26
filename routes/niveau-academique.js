
const routes = new require('express').Router();

// Add routes
routes.get('/', require('../controllers/niveau-academique').all);
routes.get('/:id', require('../controllers/niveau-academique').one);
routes.post('/', require('../midleweares/auth').checkManyRole(['admin', 'agent']), require('../controllers/niveau-academique').store);
routes.put('/:id', require('../midleweares/auth').checkManyRole(['admin', 'agent']), require('../controllers/niveau-academique').update);
routes.delete('/:id', require('../midleweares/auth').checkManyRole(['admin', 'agent']), require('../controllers/niveau-academique').delete);

module.exports = routes;
