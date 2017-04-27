const Sequelize = require("sequelize");

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.addColumn('UserOnboardData', 'invitationCode', {
        type:Sequelize.UUID,
        allowNull:true
      })
    ]);
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.removeColumn('UserOnboardData', 'invitationCode')
    ]);
  }
};
