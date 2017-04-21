const Sequelize = require("sequelize");

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.createTable('UserOnboardData', {
        userId: {
          type:Sequelize.STRING(100),
          primaryKey: true,
          allowNull: false,
          validate: {
            notEmpty: true
          }
        },
        companyName: {
          type:Sequelize.STRING(50),
          allowNull: false
        },
        vatIdentNo: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        taxIdentNo: {
          type:Sequelize.STRING(30),
          allowNull: true
        },
        dunsNo: {
          type:Sequelize.STRING(30),
          allowNull: true
        },
        commercialRegisterNo: {
          type:Sequelize.STRING(30),
          allowNull: true
        },
        serviceName: {
          type:Sequelize.STRING(30),
          allowNull: false
        },
        contactId: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        campaignId: {
          type: Sequelize.STRING(30),
          allowNull: true
        }
      })
    ]);
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.dropTable('UserOnboardData')
    ]);
  }
};
