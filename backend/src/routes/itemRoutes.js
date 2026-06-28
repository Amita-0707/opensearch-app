const express = require('express');
const { createItem, getItems, updateItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.route('/').get(getItems).post(createItem);
router.route('/:id').put(updateItem).delete(deleteItem);

module.exports = router;