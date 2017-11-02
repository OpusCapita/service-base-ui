'use strict';

/*svs_invoice 2 admin role data*/
const svcInvoiceHasAdminRole = {
  userId: 'svc_invoice',
  roleId: 'admin',
  createdBy: 'The Doctor',
  createdOn: new Date()
};

/*
* Up Migration - create svc_invoice 2 admin role mapping
*/
module.exports.up = function(db, config) {
  return db.queryInterface.bulkInsert('UserHasRole', [svcInvoiceHasAdminRole]);
}

/*
* Down Migration - drop svc_invoice 2 admin role mapping
*/
module.exports.down = function(db, config) {
  return db.queryInterface.bulkDelete('UserHasRole', {
    userId: svcInvoiceHasAdminRole.userId,
    roleId: svcInvoiceHasAdminRole.roleId
  });
}
