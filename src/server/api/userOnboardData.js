'use strict'

const Promise = require('bluebird');

module.exports.init = function(db, config)
{
    this.db = db;

    return Promise.resolve(this);
}

module.exports.create = function(userDetails, tradingPartnerDetails, campaignTool)
{
    return this.db.models.UserOnboardData.create({
        userDetails: JSON.stringify(userDetails),
        tradingPartnerDetails: JSON.stringify(tradingPartnerDetails),
        campaignTool: campaignTool
    });
}

module.exports.findByInvitationCode = function(invitationCode)
{
    return this.db.models.UserOnboardData.findOne({where: {invitationCode: invitationCode}});
}

module.exports.findByUserId = function(userId)
{
    return this.db.models.UserOnboardData.findOne({where: {userId: userId}});
}

module.exports.find = function(userId)
{
    return this.db.models.UserOnboardData.findOne({where: {userId: userId} });
}

module.exports.updateByInvitationCode = function(invitationCode, data)
{
    return this.db.models.UserOnboardData.update(data.dataValues || data, {where: {invitationCode: invitationCode}});
}