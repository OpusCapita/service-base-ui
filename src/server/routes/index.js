'use strict'

const Promise = require('bluebird');
const extend = require('extend');
const RedisEvents = require('ocbesbn-redis-events');
const Users = require('../api/users.js');
const UserOnboardData = require('../api/userOnboardData.js');

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
    return Promise.all([
        Users.init(db, config),
        UserOnboardData.init(db, config)
    ])
    .then(() =>
    {
        this.events = new RedisEvents({ consul : { host : 'consul' } });

        app.use(checkContentType);

        /* duplicate endpoint for backwards compatibility */
        app.get(['/onboardData/:userId', '/onboardingdata/:userId'], (req, res) => this.getOnboardData(req, res));
        app.get('/onboardingdata', (req, res) => this.getOnboardingData(req, res));
        app.post('/onboardingdata', (req, res) => this.addOnboardingData(req, res));
        app.put('/onboardingdata/:invitationCode', (req, res) => this.updateOnboardingData(req, res));

        app.get('/users', (req, res) => this.sendUsers(req, res));
        app.post('/users', (req, res) => this.addUser(req, res));

        app.get('/users/current', (req, res) => this.sendUser(req, res, true));
        app.get('/users/:id', (req, res) => this.sendUser(req, res));

        app.put('/users/current', (req, res) => this.updateUser(req, res, true));
        app.put('/users/:id', (req, res) => this.updateUser(req, res));

        app.get('/users/current/profile', (req, res) => this.sendUserProfile(req, res, true));
        app.get('/users/:id/profile', (req, res) => this.sendUserProfile(req, res));

        app.put('/users/current/profile', (req, res) => this.addOrUpdateUserProfile(req, res, true));
        app.put('/users/:id/profile', (req, res) => this.addOrUpdateUserProfile(req, res));

        app.get('/roles', (req, res) => this.sendRoles(req, res));
        app.get('/roles/:id', (req, res) => this.sendRole(req, res));

        app.post('/roles', (req, res) => this.addUserRoles(req, res));

        app.put('/users/:userId/roles/:roleId', (req, res) => this.addUserToRole(req, res));
    });
}



module.exports.getOnboardData = function(req, res)
{
    UserOnboardData.find({ userId : req.params.userId }).then(onboardData =>
    {
        if(onboardData)
            res.json(onboardData);
        else
            res.status(404).json({ message: 'No Onboarding-Data was found for this user ID.' });
    })
    .catch(err => res.status(500).json({ message : err.message }));
}

module.exports.addUser = function(req, res)
{
    Users.userExists(req.body.id).then(exists =>
    {
        if(exists)
        {
            res.status('409').json({ message : 'A user with this ID does already exist.' });
        }
        else
        {
            var user = req.body;
            user.createdBy = req.opuscapita.userData('id') || 'The Doctor';

            if(!Array.isArray(user.roles))
                user.roles = [ ];

            if(user.roles.indexOf('user') === -1)
                user.roles.push('user');

            var resultUser;
            var userProfile;

            if(typeof user.profile === 'object')
            {
                userProfile = user.profile;
                userProfile.createdBy = user.createdBy;

                delete user.profile;
            }
            else
            {
                userProfile = {
                    userId : user.id,
                    createdBy : user.createdBy
                };
            }

            return Users.addUser(user, true)
                .then(user => resultUser = user)
                .then(() => Users.addOrUpdateUserProfile(user.id, userProfile))
                .then(() => this.events.emit(resultUser, 'user.added'))
                .then(() => res.status('202').json(resultUser));
        }
    })
    .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.updateUser = function(req, res, useCurrentUser)
{
    var userId = useCurrentUser ? req.opuscapita.userData('id') : req.params.id;

    Users.userExists(userId).then(exists =>
    {
        if(exists)
        {
            var user = req.body;
            user.changedBy = req.opuscapita.userData('id') || 'The Doctor';

            if(Array.isArray(user.roles) && user.roles.indexOf('user') === -1)
                user.roles.push('user');

            var userProfile;

            if(typeof user.profile === 'object')
            {
                userProfile = user.profile;
                userProfile.userId = userId;
                userProfile.changedBy = user.changedBy;

                delete user.profile;
            }

            return Users.updateUser(userId, user, true).then(user =>
            {
                var preCond = userProfile ? Users.addOrUpdateUserProfile(userId, userProfile)
                    : Promise.resolve();

                return preCond.then(() =>
                {
                    return this.events.emit(user, 'user.updated')
                        .then(() => res.status('202').json(user));
                });
            })
        }
        else
        {
            res.status('404').json({ message : 'A user with this ID does not exist.' });
        }
    })
    .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.addOrUpdateUserProfile = function(req, res, useCurrentUser)
{
    var userId = useCurrentUser ? req.opuscapita.userData('id') : req.params.id;

    Users.userExists(userId).then(exists =>
    {
        if(exists)
        {
            var profile = req.body;
            profile.createdBy = req.opuscapita.userData('id');
            profile.changedBy = profile.createdBy;

            return Users.addOrUpdateUserProfile(userId, profile, true).then(profile =>
            {
                return this.events.emit(profile, 'user/profile.updated')
                    .then(() => res.status('202').json(profile));
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
    var searchObj = { };
    var customerId = req.query.customerId ? req.query.customerId.replace(/\s/g, '').toLowerCase().split(',') : null;
    var supplierId = req.query.supplierId ? req.query.supplierId.replace(/\s/g, '').toLowerCase().split(',') : null;
    var includes = req.query.include ? req.query.include.replace(/\s/g, '').toLowerCase().split(',') : [ ];

    if(customerId)
        searchObj.customerId = customerId;
    if(supplierId)
        searchObj.supplierId = supplierId;

    if(req.query.ids)
    {
        searchObj.id = Array.isArray(req.query.ids) ? req.query.ids
            : req.query.ids.replace(/\s/g, '').toLowerCase().split(',');
    }

    Users.getUsers(searchObj, includes).then(users => res.json(users));
}

module.exports.sendUser = function(req, res, useCurrentUser)
{
    var userId = useCurrentUser ? req.opuscapita.userData('id') : req.params.id;
    var includes = req.query.include ? req.query.include.replace(/\s/g, '').toLowerCase().split(',') : [];

    Users.getUser(userId, includes).then(user =>
    {
        (user && res.json(user)) || res.status('404').json({ message : 'User does not exist!' });
    });
}

module.exports.sendUserProfile = function(req, res, useCurrentUser)
{
    var userId = useCurrentUser ? req.opuscapita.userData('id') : req.params.id;

    Users.getUserProfile(userId).then(profile =>
    {
        (profile && res.json(profile)) || res.status('404').json({ message : 'Profile does not exist!' });
    });
}

module.exports.sendRoles = function(req, res)
{
    Users.getUserRoles().then(roles =>
    {
        res.json(roles);
    });
}

module.exports.sendRole = function(req, res)
{
    Users.getUserRole(req.params.id).then(role =>
    {
        (role && res.json(role)) || res.status('404').json({ message : 'Role does not exist!' });
    });
}

module.exports.addUserRoles = function(req, res)
{
    var userId = req.opuscapita.userData('id');
    var roles = req.body.map(role => role.createdBy = userId);

    Users.addUserRoles(roles, true).then(roles => res.json(roles))
        .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.addUserToRole = function(req, res)
{
    const userId = req.params.userId;
    const roleId = req.params.roleId;
    const creatorId = req.opuscapita.userData('id');

    Users.userExists(userId).then(exists =>
    {
        if(exists)
        {
            Users.userRoleExists(roleId).then(roleExists =>
            {
                if(roleExists)
                    Users.addUserToRole(userId, roleId, creatorId, true).then(roles => res.status('201').json(roles));
                else
                    res.status('404').json({ message : 'A role with this ID does not exist.' });
            })
            .catch(e => res.status('400').json({ message : e.message }));
        }
        else
        {
            res.status('404').json({ message : 'A user with this ID does not exist.' });
        }
    })
    .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.addOnboardingData = function(req, res)
{
    UserOnboardData.find({ userId : req.body.userId }).then(data =>
    {
        if(data && data.type === 'singleUse')
        {
            res.status('409').json({ message : 'Onboarding-Data does already exist for the passed user ID.' });
        }
        else
        {
            return UserOnboardData.create(req.body).then(result =>
            {
                return this.events.emit(result, 'onboardingdata.created')
                    .then(() => res.status('202').json(result));
            });
        }

    })
    .catch(e => res.status('400').json({ message : e.message }));
}


/**
 * We want to support a query langauge like:
 *   "filter=<fieldname> <operator> <restriction>"
 * Currently supported operator: eq
 * Example: Filter=invitationCode eq <value>
 *
 * ToDo move to another module and enhance
 * TODO: Supported operators: eq, lt, gt, ...
 * TODO: additional query paramter: &pagesize=x&pageno=y
 *
 * @param  {object} req [Express] {@link http://expressjs.com/de/api.html#req}]
 *                      - req.query.filter - required
 * @param  {object} res [Express] {@link http://expressjs.com/de/api.html#res}
 */
module.exports.getOnboardingData = function (req, res)
{
    try
    {
        var filter = parseFilter(req.query.filter, ["invitationCode", "userId"], ["eq"])
        var fieldName = filter[0]
        var value = filter[2]

        if(fieldName == "invitationCode")
        {
            UserOnboardData.find({ invitationCode : value, userId : null }).then(onboardingdata =>
            {
                (onboardingdata && res.json(onboardingdata))
                    || res.status(404).json({ message: 'No record found for InvitationCode = "' + value });
            })
            .catch(err => res.status('400').json({ message : err.message }));
        }
        else
        {
            UserOnboardData.find({ userId : value }).then(onboardingdata =>
            {
                (onboardingdata && res.json(onboardingdata))
                    || res.status(404).json({ message: 'No record found for UserId = "' + value });
            })
            .catch(err => res.status('400').json({ message : err.message }));
        }
    }
    catch(err)
    {
        res.status('400').json({ message : 'A valid query parameter "filter" is required.'});
    }
}

module.exports.updateOnboardingData = function(req, res)
{
    var invitationCode = req.params.invitationCode;
    var input = req.body;

    return UserOnboardData.find({ invitationCode : invitationCode, userId : null }).then(found =>
    {
        if(found)
        {
            delete found.id;

            if(found.type === 'singleUse')
            {
                return UserOnboardData.updateByInvitationCode(invitationCode, input).then(data =>
                {
                    return this.events.emit(data, 'onboardingdata.updated')
                        .then(() => res.status('202').json(data));
                });
            }
            else if(found.type === 'multipleUse')
            {
                return UserOnboardData.updateByInvitationCode(invitationCode, input).then(data =>
                {
                    if(input.userId)
                    {
                        return UserOnboardData.create(found)
                            .then(() => this.events.emit(found, 'onboardingdata.created'))
                            .then(() => res.status('202').json(data))
                    }
                    else
                    {
                        return this.events.emit(data, 'onboardingdata.updated')
                            .then(() => res.status('202').json(data));
                    }
                });
            }
        }
        else
        {
            res.status('404').json({ message : 'Invitation code could not be found.' });
        }
    })
    .catch(e => console.log(e) || res.status('400').json({ message : e.message }));
}

/**
 * Restrictions: Only single filter condition
 * examples:
 * - invitationCode eq 12345
 * - userId eq abc@de.com
 *
 * TODO: Move to another module and enhance error handling (which fields or operator are valid) and functionality (between, AND, OR, ...)
 * TODO: An additonal method to generate Sequalize queries directly from the filter Array.
 *
 * @param  {string} filter          Template: filter=<fieldname> <op> <value>
 * @param  {array} allowedFields    List of allowed fields for the filter string.
 * @param  {array} allowedOperators List of allowed operators for the filter string.
 * @return {array}
 */
function parseFilter(filter, allowedFields, allowedOperators)
{
    if(filter)
    {
        var filterArray = filter.split([' '])

        if (filterArray.length == 3 && allowedFields.includes(filterArray[0]) && allowedOperators.includes(filterArray[1]))
            return filterArray
        else
            throw new Error("Filter not of required format.")
    }
    else
    {
        throw new Error("Filter is missing");
    }
}

function checkContentType(req, res, next)
{
    var method = req.method.toLowerCase();
    var contentType = req.headers['content-type'] && req.headers['content-type'].toLowerCase();

    if(method !== 'get' && contentType !== 'application/json')
        res.status(400).json({ message : 'Invalid content type. Has to be "application/json".' });
    else
        next();
}
