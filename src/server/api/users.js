'use strict'

const Promise = require('bluebird');

module.exports.init = function(db, config)
{
    this.db = db;

    return Promise.resolve(this);
}

module.exports.getUsers = function(searchObj, includes)
{
    for(var key in searchObj)
        if(Array.isArray(searchObj[key]))
            searchObj[key] = { '$in' : searchObj[key] };

    var includeModels = [
        this.db.models.UserRole
    ];

    if(Array.isArray(includes) && includes.indexOf('profile') > -1)
        includeModels.push(this.db.models.UserProfile);

    return this.db.models.User.findAll({
        include : includeModels,
        where : searchObj
    })
    .map(user =>
    {
        user.dataValues.roles = user.UserRoles.map(role => role.id);
        user.dataValues.profile = user.UserProfile && user.UserProfile.dataValues;

        delete user.dataValues.UserRoles;
        delete user.dataValues.UserProfile;

        return user.dataValues;
    });
}

module.exports.getUser = function(userId, includes)
{
    var includeModels = [
      this.db.models.UserRole
    ];

    if(Array.isArray(includes) && includes.indexOf('profile') > -1)
        includeModels.push(this.db.models.UserProfile);

    return this.db.models.User.findById(userId, {
        include : includeModels
    })
    .then(user =>
    {
        if(user)
        {
            user.dataValues.roles = user.UserRoles.map(role => role.id);
            user.dataValues.profile = user.UserProfile && user.UserProfile.dataValues;

            delete user.dataValues.UserRoles;
            delete user.dataValues.UserProfile;

            return user.dataValues;
        }
    });
}

module.exports.getUserProfile = function(userId)
{
    return this.db.models.UserProfile.findById(userId).then(profile => profile && profile.dataValues);
}

module.exports.userExists = function(userId)
{
    return this.db.models.User.findById(userId).then(user => user && userId && user.id.toLowerCase() === userId.toLowerCase());
}

module.exports.addUser = function(user, returnUser)
{
    var roles = (user.roles && user.roles.map(roleId => ({ userId : user.id, roleId : roleId, createdBy : user.createdBy }))) || [ ];

    [ 'createdOn', 'changedOn', 'changedBy', 'roles' ].forEach(key => delete user[key]);

    return this.db.transaction(trans =>
    {
        var transaction = { transaction : trans };

        return this.db.models.User.create(user, transaction).then(() =>
        {
            if(roles.length > 0)
                return Promise.all(roles.map(role => this.db.models.UserHasRole.upsert(role, transaction)));
        });
    })
    .then(() => returnUser ? this.getUser(user.id) : user.id);

}

module.exports.updateUser = function(userId, user, returnUser)
{
    var roles = (user.roles && user.roles.map(roleId => ({ userId : userId, roleId : roleId, createdBy : user.changedBy }))) || [ ];

    [ 'createdOn', 'changedOn', 'createdBy', 'roles' ].forEach(key => delete user[key]);

    user.id = userId;

    return this.db.transaction(trans =>
    {
        var transaction = { transaction : trans };

        return this.db.models.User.update(user, {
            where : {
                id : userId
            },
            transaction : trans
        })
        .then(() =>
        {
            if(roles.length > 0)
            {
                return this.getUser(userId).then(user =>
                {
                    return Promise.all(roles.map(role =>
                    {
                        return this.db.models.UserHasRole.destroy({
                            where : { userId : userId },
                            transaction : trans
                        })
                        .then(() => this.db.models.UserHasRole.upsert(role, transaction))
                    }));
                });
            }
        });
    })
    .then(() => returnUser ? this.getUser(userId) : userId);
}

module.exports.addOrUpdateUserProfile = function(userId, profile, returnProfile)
{
    return this.userExists(userId).then(exists =>
    {
        if(exists)
        {
            return this.getUserProfile(userId).then(p =>
            {
                profile.userId = userId;

                if(p)
                {
                    [ 'createdOn', 'changedOn', 'createdBy' ].forEach(key => delete profile[key]);

                    return this.db.models.UserProfile.update(profile,  { where : { userId : userId } })
                        .then(() => returnProfile ? this.getUserProfile(userId) : userId);
                }
                else
                {
                    [ 'createdOn', 'changedOn', 'changedBy' ].forEach(key => delete profile[key]);

                    return this.db.models.UserProfile.create(profile)
                        .then(() => returnProfile ? this.getUserProfile(userId) : userId);
                }
            });
        }
        else
        {
            throw new Error('A user with this ID does not exist.');
        }
    })
}

module.exports.addUserToRole = function(userId, roleId, createdBy, returnRoles)
{
    const options = { where: { userId : userId, roleId : roleId }, defaults : { createdBy : createdBy } };

    return this.db.models.UserHasRole.findOrCreate(options).spread((userHasRole, created) =>
    {
        return returnRoles ? this.getRolesOfUser(userId) : roleId;
    });
}

module.exports.getUserRoles = function(ids)
{
    if(Array.isArray(ids))
        return this.db.models.UserRole.findAll({ where : { id : { '$in' : ids } } }).map(role => role.dataValues);

    return this.db.models.UserRole.findAll().map(role => role.dataValues);
}

module.exports.getUserRole = function(roleId)
{
    return this.db.models.UserRole.findById(roleId).then(role => role && role.dataValues);
}

module.exports.userRoleExists = function(roleId)
{
    return this.db.models.UserRole.findById(roleId).then(role => role && role.id === roleId);
}

module.exports.addUserRoles = function(roles, returnRoles)
{
    var localRules = Array.isArray(roles) ? roles : [ roles ];
    localRules = localRules.map(role => ({ id : role.id, createdBy : role.createdBy }));

    return this.db.models.UserRole.bulkCreate(localRules).then(() =>
    {
        var idsOnly = localRules.map(role => role.id);

        if(returnRoles)
            return this.getUserRoles(idsOnly);
        else
            return idsOnly
    });
}

module.exports.getRolesOfUser = function(userId)
{
    return this.db.models.UserHasRole.findAll({ where : { userId : userId } }).map(role => role.roleId);
}
