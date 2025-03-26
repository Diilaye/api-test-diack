
const routes = new require('express').Router();

// Add routes
routes.post('/', require('../midleweares/auth').checkManyRole(['sonde', 'agent']), require('../controllers/response-fomulaire-controlleur').addReponseForm);
routes.get('/', require('../midleweares/auth').checkManyRole(['sonde', 'agent']), require('../controllers/response-fomulaire-controlleur').getResponseSondeur);
routes.delete('/', require('../midleweares/auth').checkManyRole(['sonde', 'agent']), require('../controllers/response-fomulaire-controlleur').deleteResponseSondeur);

module.exports = routes;
