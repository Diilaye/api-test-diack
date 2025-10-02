
const routes = new require('express').Router();

// Add routes  require('../midleweares/auth').checkManyRole(['sondeur', 'agent'])
routes.get('/', require('../controllers/formulaire').all);
routes.get('/ByUser', require('../midleweares/auth').checkManyRole(['sondeur', 'agent']),require('../controllers/formulaire').allByUser);
routes.get('/getEmail', require('../controllers/formulaire').getAllEmail);
routes.post('/sendMailFormulaire', require('../controllers/formulaire').sendMailFormulaire);
routes.get('/:id' , require('../controllers/formulaire').one);
routes.post('/', require('../midleweares/auth').checkManyRole(['sondeur', 'agent']), require('../controllers/formulaire').add);
routes.put('/:id', require('../midleweares/auth').checkManyRole(['sondeur', 'agent']), require('../controllers/formulaire').update);
routes.delete('/:id', require('../midleweares/auth').checkManyRole(['sondeur', 'agent']), require('../controllers/formulaire').delete);

// Routes pour bloquer/débloquer (admin uniquement)
routes.put('/:id/block', require('../midleweares/auth').checkManyRole(['admin']), require('../controllers/formulaire').blockFormulaire);
routes.put('/:id/unblock', require('../midleweares/auth').checkManyRole(['admin']), require('../controllers/formulaire').unblockFormulaire);

module.exports = routes;
