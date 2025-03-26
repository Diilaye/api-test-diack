
const routes = new require('express').Router();

// Add routes
routes.get('/', require('../controllers/formulaire').all);
routes.get('/ByUser', require('../midleweares/auth').checkManyRole(['sondeur', 'agent']),require('../controllers/formulaire').allByUser);
routes.get('/getEmail', require('../controllers/formulaire').getAllEmail);
routes.post('/sendMailFormulaire', require('../controllers/formulaire').sendMailFormulaire);
routes.get('/:id',  require('../midleweares/auth').checkManyRole(['sondeur', 'agent']) , require('../controllers/formulaire').one);
routes.post('/', require('../midleweares/auth').checkManyRole(['sondeur', 'agent']), require('../controllers/formulaire').add);
routes.put('/:id', require('../midleweares/auth').checkManyRole(['sondeur', 'agent']), require('../controllers/formulaire').update);
routes.delete('/:id', require('../midleweares/auth').checkManyRole(['sondeur', 'agent']), require('../controllers/formulaire').delete);

module.exports = routes;
