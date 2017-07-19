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
