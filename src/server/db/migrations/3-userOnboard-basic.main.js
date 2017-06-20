const Sequelize = require("sequelize");

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return db.query('ALTER TABLE UserOnboardData DROP PRIMARY KEY;')
    .then(_ => {
      return queryInterface.addColumn('UserOnboardData', 'id', {
        type: Sequelize.BIGINT(),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      })
    })      
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.removeColumn('UserOnboardData', 'id')
    .then(_ => {
      return queryInterface.changeColumn('UserOnboardData', 'userId', {
          type:Sequelize.STRING(100),
          primaryKey: true,
          allowNull: false,
          validate: {
              notEmpty: true
          }
      })
    });
  }
};
