'use strict'

const Promise = require('bluebird');
const ServiceClient = require('ocbesbn-service-client');
const Users = require('../api/users.js')

/**
 * Initializes all routes for RESTful access.
 *
 * @param {object} app - [Express]{@link https://github.com/expressjs/express} instance.
 * @param {object} db - If passed by the web server initialization, a [Sequelize]{@link https://github.com/sequelize/sequelize} instance.
 * @param {object} config - Everything from [config.routes]{@link https://github.com/OpusCapitaBusinessNetwork/web-init} passed when running the web server initialization.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html}
 * @see [Minimum setup]{@link https://github.com/OpusCapitaBusinessNetwork/web-init#minimum-setup}
 */
module.exports.init = function(app, db, config)
{
    return Users.init(db, config).then(() =>
    {
        var self = this;

        app.get('/users', (req, res) => self.sendUsers(req, res));
        app.post('/users', (req, res) => self.addUser(req, res));

        app.get('/users/:id', (req, res) => self.sendUser(req, res));
        app.put('/users/:id', (req, res) => self.updateUser(req, res));

        app.get('/users/:id/profile', (req, res) => self.sendUserProfile(req, res));
        app.put('/users/:id/profile', (req, res) => self.addOrUpdateUserProfile(req, res));
    });
}

module.exports.addUser = function(req, res)
{
    var self = this;

    Users.userExists(req.body.id).then(exists =>
    {
        if(exists)
            res.status('409').json({ message : 'A user with this ID does already exist.' });
        else
            Users.addUser(req.body, true).then(user => res.json(user));
    })
    .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.updateUser = function(req, res)
{
    Users.userExists(req.params.id).then(exists =>
    {
        if(exists)
        {
            Users.updateUser(req.params.id, req.body, true).then(user =>
            {
                if(req.query.tokenUpdate == "true")
                {
                    return doUserCacheUpdate(user, req.headers).then(() => res.json(user))
                        .catch(e => res.status('424').json({ message : e.message }))
                }
                else
                {
                    res.json(user);
                }
            })
        }
        else
        {
            res.status('404').json({ message : 'A user with this ID does not exist.' });
        }
    })
    .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.addOrUpdateUserProfile = function(req, res)
{
    Users.userExists(req.params.id).then(exists =>
    {
        if(exists)
        {
            Users.addOrUpdateUserProfile(req.params.id, req.body, true).then(profile =>
            {
                if(req.query.tokenUpdate == "true")
                {
                    Users.getUserProfile(req.params.id).then(user =>
                    {
                        return doUserCacheUpdate(user, req.headers).then(() => res.json(profile))
                            .catch(e => res.status('424').json({ message : e.message }))
                    });
                }
                else
                {
                    res.json(profile);
                }
            });
        }
        else
        {
            res.status('404').json({ message : 'A user with this ID does not exist.' });
        }
    })
    .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.sendUsers = function(req, res)
{
    Users.getUsers().then(users =>
    {
        res.json(users);
    });
}

module.exports.sendUser = function(req, res)
{
    Users.getUser(req.params.id).then(user =>
    {
        (user && res.json(user)) || res.status('404').json({ message : 'Not found!' });
    });
}

module.exports.sendUserProfile = function(req, res)
{
    Users.getUserProfile(req.params.id).then(user =>
    {
        (user && res.json(user)) || res.status('404').json({ message : 'Not found!' });
    });
}

function doUserCacheUpdate(userObj, requestHeaders)
{
    var client = new ServiceClient({ consul : { host : 'consul' } });
    client.contextify({ headers : requestHeaders });

    return client.put('kong', '/refreshIdToken', userObj);
}
