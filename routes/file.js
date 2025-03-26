
const routes = new require('express').Router();

// Add routes
routes.get('/',  require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']), require('../controllers/file').all);
routes.get('/:id',  require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']), require('../controllers/file').one);
routes.post('/',  require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']), require('../controllers/file').store);
routes.delete('/:id',  require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']), require('../controllers/file').delete);

module.exports = routes;
