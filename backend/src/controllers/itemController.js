const Item = require('../models/Item');

exports.createItem = async (req, res, next) => {
  try {
    const { title, description, category, price } = req.body;
    const item = await Item.create({
      title, description, category, price, UserId: req.user.id
    });
    res.status(201).json(item);
  } catch (error) { next(error); }
};

exports.getItems = async (req, res, next) => {
  try {
    const items = await Item.findAll({ where: { UserId: req.user.id } });
    res.json(items);
  } catch (error) { next(error); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Item entity location target empty' });
    
    await item.update(req.body);
    res.json(item);
  } catch (error) { next(error); }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Item entity location target empty' });
    
    await item.destroy();
    res.json({ message: 'Item entry purged completely' });
  } catch (error) { next(error); }
};