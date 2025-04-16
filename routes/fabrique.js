
const router  = require('express').Router();

const fabriqueController = require('../controllers/fabrique');

router.post('/', fabriqueController.create);

router.get('/', fabriqueController.findAll);    


router.get('/:id', fabriqueController.findOne); 

router.put('/:id', fabriqueController.update);

router.delete('/:id', fabriqueController.delete);

module.exports = router;
