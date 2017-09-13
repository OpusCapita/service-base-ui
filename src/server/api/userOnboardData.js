'use strict'

const Promise = require('bluebird');

function parseSubProperties(data)
{
    if(data)
    {
        data.userDetails = data.userDetails && JSON.parse(data.userDetails);
        data.campaignDetails = data.campaignDetails && JSON.parse(data.campaignDetails);
        data.tradingPartnerDetails = data.tradingPartnerDetails && JSON.parse(data.tradingPartnerDetails);
    }

    return data;
}

function serializeSubProperties(data)
{
    if(data.campaignDetails)
        data.campaignDetails = JSON.stringify(data.campaignDetails);
    if(data.tradingPartnerDetails)
        data.tradingPartnerDetails = JSON.stringify(data.tradingPartnerDetails);
    if(data.userDetails)
        data.userDetails = JSON.stringify(data.userDetails);

    return data;
}

module.exports.init = function(db, config)
{
    this.db = db;

    return Promise.resolve(this);
}

module.exports.create = function(data)
{
    delete data.userId;
    data = serializeSubProperties(data.dataValues || data);

    return this.db.models.UserOnboardData.create(data)
        .then(data => data && data.dataValues)
        .then(parseSubProperties);
}

module.exports.find = function(search)
{
    return this.db.models.UserOnboardData.findOne({ where : search }).then(data => data && data.dataValues)
        .then(parseSubProperties);
}

module.exports.updateByInvitationCode = function(invitationCode, userId, data)
{
    delete data.invitationCode;
    delete data.userId;
    
    data = serializeSubProperties(data.dataValues || data);

    const where = {
        invitationCode : invitationCode,
        userId : userId
    };

    return this.db.models.UserOnboardData.update(data, { where : where })
        .then(() => this.find({ invitationCode : invitationCode, userId : data.userId }));
}
