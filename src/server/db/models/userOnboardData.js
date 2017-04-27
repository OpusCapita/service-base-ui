"use strict"
var Sequelize = require('sequelize');

module.exports.init = function(db, config) {
  /**
   * Data model representing a single user item.
   * @class UserOnboardData
   */
  const UserOnboardData = db.define('UserOnboardData',
  /** @lends UserOnboardData */
  {
    /**
     * Unique identifier of the user
     */
    userId: {
      type:Sequelize.STRING(100),
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    /**
     * Unique invitation code
     */
    invitationCode: {
        type: Sequelize.UUID,
        allowNull: true
    },
    /**
     * details of trading partner
     */
    tradingPartnerDetails: {
      type:Sequelize.STRING(300),
      allowNull:true
    },

    /**
     * Name of the service, which does the campaing
     */
    serviceName: {
      type: Sequelize.STRING(100),
      allowNull: true
    },

    /**
     * Name of the campaing tool used
     */
    campaignTool: {
      type: Sequelize.STRING(100),
      allowNull: true
    },

    /**
     * JSON details about the campaing, will be used by other services
     */
    campaignDetails: {
      type :Sequelize.STRING(300),
      allowNull:true
    },

    /**
     * JSON details about the user
     */
    userDetails: {
      type: Sequelize.STRING(300),
      allowNull:true
    }
  },
   {
      freezeTableName: true
  });

  return Promise.resolve(UserOnboardData);
};
