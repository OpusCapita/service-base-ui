const Sequelize = require("sequelize");

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
        queryInterface.changeColumn('UserOnboardData', 'userDetails', {
            type: Sequelize.TEXT('medium')
        }),
        queryInterface.changeColumn('UserOnboardData', 'invitationCode', {
            type: Sequelize.TEXT('medium')
        })
    ]);
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
        queryInterface.changeColumn('UserOnboardData', 'userDetails', {
            type: Sequelize.STRING(300),
        }),
        queryInterface.changeColumn('UserOnboardData', 'invitationCode', {
            type: Sequelize.STRING(300)
        })
    ]);
  }
};
