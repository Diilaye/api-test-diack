const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user-controller');
const { checkManyRole } = require('../midleweares/auth');

router.get('/', checkManyRole(['admin']), UserController.all);
router.post('/', UserController.store);
router.post('/auth', UserController.auth);
router.post('/auth/sonde', UserController.authSonde);
router.get('/auth', checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']), UserController.getAuth);
router.put('/:id', checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']) ,UserController.update);
router.get('/:id', checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']), UserController.one);
router.delete('/:id', checkManyRole(['admin']), UserController.delete);

module.exports = router;
