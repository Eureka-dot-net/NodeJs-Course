const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING
}, {
  hooks: {
    afterCreate: async (user, options) => {
      try {
        await user.createCart(); // this magic method is available because of the association
      } catch (err) {
        console.error('Failed to create cart for user:', err);
      }
    }
  }
});

module.exports = User;
