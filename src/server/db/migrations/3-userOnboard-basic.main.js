const Sequelize = require("sequelize");

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
        db.query('ALTER TABLE UserOnboardData DROP PRIMARY KEY;'),
        queryInterface.addColumn('UserOnboardData', 'id', {
          type: Sequelize.BIGINT(),
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
      })
    ]);
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.removeColumn('UserOnboardData', 'id'),
      queryInterface.changeColumn('UserOnboardData', 'userId', {
          type:Sequelize.STRING(100),
          primaryKey: true,
          allowNull: false,
          validate: {
              notEmpty: true
          }
      })
    ]);
  }
};
