const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { isDecimal: true }
  }
});

// Structural Relationship Mapping
User.hasMany(Item, { onDelete: 'CASCADE' });
Item.belongsTo(User);

module.exports = Item;
const { client } = require('../config/opensearch');
const logger = require('../utils/logger');

Item.addHook('afterCreate', async (item) => {
  try {
    await client.index({
      index: 'items',
      id: item.id,
      body: {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        price: parseFloat(item.price),
        userId: item.UserId
      },
      refresh: 'wait_for'
    });
  } catch (err) { logger.error('Sync failure during creation mapping execution:', err); }
});

Item.addHook('afterUpdate', async (item) => {
  try {
    await client.index({
      index: 'items',
      id: item.id,
      body: {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        price: parseFloat(item.price),
        userId: item.UserId
      },
      refresh: 'wait_for'
    });
  } catch (err) { logger.error('Sync failure during update mapping execution:', err); }
});

Item.addHook('afterDestroy', async (item) => {
  try {
    await client.delete({
      index: 'items',
      id: item.id,
      refresh: 'wait_for'
    });
  } catch (err) { logger.error('Sync failure during deletion cleanup execution:', err); }
});