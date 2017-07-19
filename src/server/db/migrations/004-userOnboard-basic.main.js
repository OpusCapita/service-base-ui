const Sequelize = require("sequelize");

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
        db.query('ALTER TABLE UserOnboardData MODIFY COLUMN userId varchar(100) NULL ;')
    ]);
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
        db.query('ALTER TABLE UserOnboardData MODIFY COLUMN userId varchar(100) NOT NULL ;')
    ]);
  }
};
