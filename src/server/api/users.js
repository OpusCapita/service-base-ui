'use strict'

const Promise = require('bluebird');

module.exports.init = function(db, config)
{
    this.db = db;

    return Promise.resolve(this);
}

module.exports.getUsers = function()
{
    return this.db.models.User.findAll();
}

module.exports.getUser = function(userId)
{
    return this.db.models.User.findById(userId);
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
    var self = this;

    delete user.createdOn;
    delete user.updatedOn;

    return this.db.models.User.create(user).then(() => returnUser ? self.getUser(user.id) : user.id);
}

module.exports.updateUser = function(userId, user, returnUser)
{
    [ 'id', 'createdOn', 'updatedOn', 'createdBy', 'updatedBy' ].forEach(key => delete user[key]);

    user.id = userId;

    var self = this;

    return this.db.models.User.update(user, { where : { id : userId } }).then(() => returnUser ? self.getUser(userId) : userId);
}

module.exports.addOrUpdateUserProfile = function(userId, profile, returnProfile)
{
    [ 'userId', 'createdOn', 'updatedOn', 'updatedBy' ].forEach(key => delete profile[key]);

    profile.userId = userId;

    var self = this;

    return this.userExists(userId).then(exists =>
    {
        if(exists)
        {
            return self.db.models.UserProfile.upsert(profile)
                .then(() => returnProfile ? self.getUserProfile(userId) : userId);
        }
        else
        {
            throw new Error('A user with this ID does not exist.');
        }
    })
}
