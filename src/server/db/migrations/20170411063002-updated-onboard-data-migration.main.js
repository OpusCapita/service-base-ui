const Sequelize = require('sequelize');
 
module.exports = {
  up: function (db) {
    const queryInterface = db.getQueryInterface();
 
    return Promise.all([
      queryInterface.addColumn('UserOnboardData', 'tradingPartnerDetails', {
        type:Sequelize.STRING(300),
        allowNull:true
      }),
      queryInterface.addColumn('UserOnboardData', 'userDetails', {
        type:Sequelize.STRING(300),
        allowNull:true
      }),
      queryInterface.removeColumn('UserOnboardData', 'companyName'),
      queryInterface.removeColumn('UserOnboardData', 'taxIdentNo'),
      queryInterface.removeColumn('UserOnboardData', 'vatIdentNo'),
      queryInterface.removeColumn('UserOnboardData', 'dunsNo'),
      queryInterface.removeColumn('UserOnboardData', 'commercialRegisterNo'),
      queryInterface.removeColumn('UserOnboardData', 'serviceName'),
      queryInterface.removeColumn('UserOnboardData', 'contactId'),
      queryInterface.removeColumn('UserOnboardData', 'campaignId')
    ]);
  },
 
  down: function (db) {
    const queryInterface = db.getQueryInterface();
 
    return [
      queryInterface.removeColumn('UserOnboardData', 'userDetails'),
      queryInterface.removeColumn('UserOnboardData', 'tradingPartnerDetails'),
      queryInterface.addColumn('UserOnboardData', 'companyName', {type: Sequelize.STRING(50), allowNull: false}),
      queryInterface.addColumn('UserOnboardData', 'taxIdentNo', {type: Sequelize.STRING(30), allowNull: true}),
      queryInterface.addColumn('UserOnboardData', 'vatIdentNo', {type: Sequelize.STRING(30), allowNull: true}),
      queryInterface.addColumn('UserOnboardData', 'dunsNo', {type: Sequelize.STRING(30), allowNull: true}),
      queryInterface.addColumn('UserOnboardData', 'commercialRegisterNo', {type: Sequelize.STRING(30), allowNull: true}),
      queryInterface.addColumn('UserOnboardData', 'serviceName', {type: Sequelize.STRING(30), allowNull: false}),
      queryInterface.addColumn('UserOnboardData', 'contactId', {type: Sequelize.STRING(30), allowNull: true}),
      queryInterface.addColumn('UserOnboardData', 'campaignId', {type: Sequelize.STRING(30), allowNull: true})
    ];
  }
};
