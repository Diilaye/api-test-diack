
const routes = new require('express').Router();

// Add routes r
routes.post('/', require('../midleweares/auth').checkManyRole(['sonde', 'agent']), require('../controllers/response-fomulaire-controlleur').addReponseForm);
routes.post('/sondee/:id', require('../controllers/response-fomulaire-controlleur').addResponseSondee);
routes.get('/', require('../midleweares/auth').checkManyRole(['sonde', 'agent']), require('../controllers/response-fomulaire-controlleur').getResponseSondeur);
routes.get('/by-formulaire/:idformulaire', require('../controllers/response-fomulaire-controlleur').getAllReponseByFormulaire);
routes.delete('/', require('../midleweares/auth').checkManyRole(['sonde', 'agent']), require('../controllers/response-fomulaire-controlleur').deleteResponseSondeur);

module.exports = routes;
