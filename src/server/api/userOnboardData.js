'use strict'

const Promise = require('bluebird');

module.exports.init = function(db, config)
{
    this.db = db;

    return Promise.resolve(this);
}

module.exports.create = function(userDetails, tradingPartnerDetails)
{
    return this.db.models.UserOnboardData.create({
        userDetails: JSON.stringify(userDetails),
        tradingPartnerDetails: JSON.stringify(tradingPartnerDetails)
    });
}

module.exports.findByInvitationCode = function(invitationCode)
{
    return this.db.models.UserOnboardData.findOne({where: {invitationCode: invitationCode}});
}

module.exports.find = function(userId)
{
    return this.db.models.UserOnboardData.findOne({where: {userId: userId} });
}

module.exports.update = function(userId, data)
{
    return this.db.models.UserOnboardData.update(data.dataValues || data, {userId: userId});
}
