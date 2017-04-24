const Sequelize = require("sequelize");

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.addColumn('UserOnboardData', 'campaignTool', {
        type:Sequelize.STRING(100),
        allowNull:true
      }),
      queryInterface.addColumn('UserOnboardData', 'campaignDetails', {
        type:Sequelize.STRING(300),
        allowNull:true
      }),
      queryInterface.addColumn('UserOnboardData', 'serviceName', {
        type:Sequelize.STRING(100),
        allowNull:true
      })
    ]);
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.removeColumn('UserOnboardData', 'campaignTool'),
      queryInterface.removeColumn('UserOnboardData', 'campaignDetails'),
      queryInterface.removeColumn('UserOnboardData', 'serviceName')
    ]);
  }
};
