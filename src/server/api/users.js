'use strict'

const Promise = require('bluebird');

module.exports.init = function(db, config)
{
    this.db = db;

    return Promise.resolve(this);
}

module.exports.getUsers = function()
{
    return this.db.models.User.findAll({
        include : this.db.models.UserRole
    })
    .map(user =>
    {
        user.dataValues.roles = user.UserRoles.map(role => role.id);
        delete user.dataValues.UserRoles;

        return user;
    });
}

module.exports.getUser = function(userId)
{
    return this.db.models.User.findById(userId,{
        include : this.db.models.UserRole
    })
    .then(user =>
    {
        user.dataValues.roles = user.UserRoles.map(role => role.id);
        delete user.dataValues.UserRoles;

        return user;
    });
}

module.exports.getUserProfile = function(userId)
{
    return this.db.models.UserProfile.findById(userId);
}

module.exports.userExists = function(userId)
{
    return this.db.models.User.findById(userId).then(user => user && user.id === userId);
}

module.exports.addUser = function(user, returnUser)
{
    var roles = (user.roles && user.roles.map(roleId =>
    {
        return { userId : user.id, roleId : roleId, createdBy : user.createdBy };
    })) || [ ];

    delete user.createdOn;
    delete user.updatedOn;
    delete user.roles;

    return this.db.transaction(trans =>
    {
        var transaction = { transaction : trans };

        return this.db.models.User.create(user, transaction).then(() =>
        {
            if(roles.length > 0)
                return Promise.all(roles.map(role => this.db.models.UserHasRole.create(role, transaction)));
        });
    })
    .then(() => returnUser ? this.getUser(user.id) : user.id);

}

module.exports.updateUser = function(userId, user, returnUser)
{
    var roles = (user.roles && user.roles.map(roleId => ({ userId : userId, roleId : roleId }))) || [ ];

    [ 'id', 'createdOn', 'updatedOn', 'createdBy', 'updatedBy', 'roles' ].forEach(key => delete user[key]);

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
                            where : {
                                userId : userId
                            },
                            transaction : trans
                        })
                        .then(() =>
                        {
                            role.createdBy = user.createdBy;
                            return this.db.models.UserHasRole.upsert(role, transaction);
                        })
                    }));
                });
            }
        });
    })
    .then(() => returnUser ? this.getUser(userId) : userId);
}

module.exports.addOrUpdateUserProfile = function(userId, profile, returnProfile)
{
    [ 'userId', 'createdOn', 'updatedOn', 'updatedBy' ].forEach(key => delete profile[key]);

    profile.userId = userId;

    return this.userExists(userId).then(exists =>
    {
        if(exists)
        {
            return this.db.models.UserProfile.upsert(profile)
                .then(() => returnProfile ? this.getUserProfile(userId) : userId);
        }
        else
        {
            throw new Error('A user with this ID does not exist.');
        }
    })
}
