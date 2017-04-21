"use strict"
var Sequelize = require('sequelize');

module.exports.init = function(db, config) {
  const UserOnboardData = db.define('UserOnboardData', {
    userId: {
      type:Sequelize.STRING(100),
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    tradingPartnerDetails:
    {
      type:Sequelize.STRING(300),
      allowNull:true
    },

    userDetails:
    {
      type:Sequelize.STRING(300),
      allowNull:true
    }
  },
   {
      tableName: 'UserOnboardData',
      freezeTableName: true

    });

  return Promise.resolve(UserOnboardData);
};
