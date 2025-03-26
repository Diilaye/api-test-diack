
const routes = new require('express').Router();

// Add routes
routes.get('/', require('../controllers/champ').all);
routes.get('/formulaire/:idForm', require('../controllers/champ').allByFormulaire);
routes.get('/:id', require('../controllers/champ').one);
routes.post('/', require('../midleweares/auth').checkManyRole(['admin', 'sondeur']), require('../controllers/champ').store);
routes.put('/textfield/:id', require('../midleweares/auth').checkManyRole(['admin', 'sondeur']), require('../controllers/champ').reponseTexield);
routes.put('/multichoice/:id', require('../midleweares/auth').checkManyRole(['admin', 'sondeur']), require('../controllers/champ').reponseMultiChoice);
routes.put('/:id', require('../midleweares/auth').checkManyRole(['admin', 'sondeur']), require('../controllers/champ').update);
routes.delete('/:id', require('../midleweares/auth').checkManyRole(['admin', 'sondeur']), require('../controllers/champ').delete);

module.exports = routes;
