'use strict'

const Promise = require('bluebird');
const DataTypes = require('sequelize');

module.exports.init = function(db, config)
{
    /**
     * Data model representing a single user item.
     * @class User
     */
    var User = db.define('User',
    /** @lends User */
    {
        /** Unique identifier usually concatenated of federation id ':' and user id to ensure unique user names. */
        id : {
            type : DataTypes.STRING(100),
            allowNull : false,
            primaryKey : true
        },
        /**  Id of the federation owning a user identity. */
        federationId : {
            type : DataTypes.STRING(50),
            allowNull : false,
            defaultValue : ''
        },
        /** Identifier of supplier a user is assigned to. */
        supplierId : {
            type : DataTypes.STRING(30),
            allowNull : true
        },
        /** Identifier of customer a user is assigned to. */
        customerId : {
            type : DataTypes.STRING(30),
            allowNull : true
        },
        /**  Representing the current lifecycle status of a user. */
        status : {
            type : DataTypes.STRING(100),
            allowNull : false
        },
        /** Whenever to enable cross tenant access. */
        mayChangeSupplier : {
            type : DataTypes.BOOLEAN(),
            allowNull : false,
            defaultValue : false
        },
        /** Whenever to enable cross tenant access. */
        mayChangeCustomer : {
            type : DataTypes.BOOLEAN(),
            allowNull : false,
            defaultValue : false
        },
        createdBy : {
            type : DataTypes.STRING(60),
            allowNull : false,
            defaultValue: 'Opuscapita user'
        },
        changedBy : {
            type : DataTypes.STRING(60),
            allowNull : false,
            defaultValue : 'Opuscapita user'
        },
        createdOn : {
            type : DataTypes.DATE(),
            allowNull : false,
            defaultValue : DataTypes.NOW
        },
        changedOn : {
            type : DataTypes.DATE(),
            allowNull : true
        }
    }, {
        hooks : {
            beforeValidate : (a, b, next) => { a.changedOn = new Date(); next(); }
        },
        freezeTableName: true,
        updatedAt : 'changedOn',
        createdAt : 'createdOn',
    });

    /**
     * Data model representing a single user's profile.
     * @class UserProfile
     */
    var UserProfile = db.define('UserProfile',
    /** @lends UserProfile */
    {
        /** Unique identifier usually concatenated of federation id ':' and user id to ensure unique user names. */
        userId : {
            type : DataTypes.STRING(100),
            allowNull : false,
            primaryKey : true
        },
        /** A user's email address. */
        email : {
            type : DataTypes.STRING(100),
            allowNull : false
        },
        /** A user's language preference in as in ISO 639-1/2 */
        languageId : {
            type : DataTypes.STRING(3),
            allowNull : false,
            defaultValue : 'en'
        },
        /** A user's country preference in as in ISO 3166-1 alpha2 */
        countryId : {
            type : DataTypes.STRING(2),
            allowNull : false,
            defaultValue : 'EU'
        },
        /** Identifier of a user's time zone. */
        timeZoneId : {
            type : DataTypes.STRING(50),
            allowNull : false,
            defaultValue : 'CET'
        },
        salutation : {
            type : DataTypes.STRING(20),
            allowNull : false
        },
        firstName : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        lastName : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        birthday : {
            type : DataTypes.DATE(),
            allowNull : true
        },
        degree : {
            type : DataTypes.STRING(20),
            allowNull : false,
            defaultValue : ''
        },
        phoneNo : {
            type : DataTypes.STRING(20),
            allowNull : false,
            defaultValue : ''
        },
        faxNo : {
            type : DataTypes.STRING(100),
            allowNull : false,
            defaultValue : ''
        },
        department : {
            type : DataTypes.STRING(40),
            allowNull : false,
            defaultValue : ''
        },
        building : {
            type : DataTypes.STRING(40),
            allowNull : false,
            defaultValue : ''
        },
        floor : {
            type : DataTypes.STRING(40),
            allowNull : false,
            defaultValue : ''
        },
        room : {
            type : DataTypes.STRING(40),
            allowNull : false,
            defaultValue : ''
        },
        createdBy : {
            type : DataTypes.STRING(60),
            allowNull : false
        },
        changedBy : {
            type : DataTypes.STRING(60),
            allowNull : false,
            defaultValue : ''
        },
        createdOn : {
            type : DataTypes.DATE(),
            allowNull : false,
            defaultValue : DataTypes.NOW
        },
        changedOn : {
            type : DataTypes.DATE(),
            allowNull : true
        }
      }, {
        freezeTableName: true,
        updatedAt : 'changedOn',
        createdAt : 'createdOn',
    });

    /**
     * Data model representing a single user's profile.
     * @class UserProfile
     */
    var UserRole = db.define('UserRole',
    /** @lends UserProfile */
    {
        id : {
            type : DataTypes.STRING(100),
            allowNull : false,
            primaryKey : true
        },
        createdBy : {
            type : DataTypes.STRING(60),
            allowNull : false
        },
        changedBy : {
            type : DataTypes.STRING(60),
            allowNull : false,
            defaultValue : ''
        },
        createdOn : {
            type : DataTypes.DATE(),
            allowNull : false,
            defaultValue : DataTypes.NOW
        },
        changedOn : {
            type : DataTypes.DATE(),
            allowNull : true
        }
      }, {
        freezeTableName: true,
        updatedAt : 'changedOn',
        createdAt : 'createdOn',
    });

    /**
     * Data model representing a single user's profile.
     * @class UserProfile
     */
    var UserHasRole = db.define('UserHasRole',
    /** @lends UserProfile */
    {
        userId : {
            type : DataTypes.STRING(100),
            allowNull : false,
            primaryKey : true
        },
        roleId : {
            type : DataTypes.STRING(100),
            allowNull : false,
            primaryKey : true
        },
        createdBy : {
            type : DataTypes.STRING(60),
            allowNull : false
        },
        changedBy : {
            type : DataTypes.STRING(60),
            allowNull : false,
            defaultValue : ''
        },
        createdOn : {
            type : DataTypes.DATE(),
            allowNull : false,
            defaultValue : DataTypes.NOW
        },
        changedOn : {
            type : DataTypes.DATE(),
            allowNull : true
        }
      }, {
        freezeTableName: true,
        updatedAt : 'changedOn',
        createdAt : 'createdOn'
    });

    User.hasOne(UserProfile, { foreignKey : 'userId', as : 'profile', constraints : true });
    User.belongsToMany(UserRole, { through : 'UserHasRole', foreignKey : 'userId', constraints : true });
    UserRole.belongsToMany(User, { through : 'UserHasRole', foreignKey : 'roleId', constraints : true });

    return Promise.resolve();
}
