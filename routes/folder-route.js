const express = require('express');
const folderCtrl = require('../controllers/folder');

const router = express.Router();

// Example controller functions (you need to implement these)

// Route to get all folders
router.get('/', require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']), folderCtrl.all);


// Route to get all folders by user
router.get('/ByUser', require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']), folderCtrl.allByUser);

// Route to create a new folder
router.post('/',  require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']) ,folderCtrl.add);

// Route to get a folder by ID
router.get('/:id',require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']) , folderCtrl.one);

// Route to update a folder by ID
router.put('/:id', require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']) , folderCtrl.update);

// Route to delete a folder by ID
router.delete('/:id', require('../midleweares/auth').checkManyRole(['admin', 'agent', 'etudiant', 'entreprise', 'employe', 'sondeur']) , folderCtrl.delete);

module.exports = router;