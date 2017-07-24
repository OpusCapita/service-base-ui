"use strict"
var Sequelize = require('sequelize');

module.exports.init = function(db, config)
{
    /**
     * Data model representing a single user item.
     * @class UserOnboardData
     */
    const UserOnboardData = db.define('UserOnboardData',
    /** @lends UserOnboardData */
    {
        /**
         * Unique identifier of the user
         */
        userId: {
            type: Sequelize.STRING(100),
            allowNull: true
        },
        /**
         * Unique invitation code
         */
        invitationCode: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: true
        },

        /**
         * Defines the type of a single object. Mainly to
         * differ between usage concepts.
         */
        type: {
            type: Sequelize.STRING(30),
            defaultValue: 'singleUse'
        },

        /**
         * details of trading partner
         */
        tradingPartnerDetails: {
            type: Sequelize.TEXT('medium'),
            allowNull: true
        },

        /**
         * Name of the service, which does the campaing
         */
        serviceName: {
            type: Sequelize.STRING(100),
            allowNull: true
        },

        /**
         * Name of the campaing tool used
         */
        campaignTool: {
            type: Sequelize.STRING(100),
            allowNull: true
        },

        /**
         * JSON details about the campaing, will be used by other services
         */
        campaignDetails: {
            type: Sequelize.TEXT('medium'),
            allowNull: true
        },

        /**
         * JSON details about the user
         */
        userDetails: {
            type: Sequelize.TEXT('medium'),
            allowNull: true
        },

        /**
         * JSON details for service specific configuration.
         */
        serviceDetails: {
            type: Sequelize.TEXT('medium'),
            allowNull: true
        }
    }, {
        freezeTableName: true
    });

    return Promise.resolve(UserOnboardData);
};
