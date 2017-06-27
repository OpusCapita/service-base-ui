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
        app.put('/onboardingdata/:invitationCode', (req, res) => this.updateOnboarddataUseridByInvitationcode(req, res));

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
  UserOnboardData.find(req.params.userId).then((userData) => {
    if (userData) {
    let onboardData = userData;
      onboardData.userDetails = JSON.parse(userData.userDetails);
      onboardData.campaignDetails = JSON.parse(userData.campaignDetails);
      onboardData.tradingPartnerDetails = JSON.parse(userData.tradingPartnerDetails);

      res.json(onboardData);
    } else {
      res.status(404).json({message: 'No record found'})
    }
  }).catch((err) => {
    res.status(500).json({message: 'Unexpected error: ' + err});
  });
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
            return Users.addUser(req.body, true)
            .then((user) => {
                return this.events.emit(user, 'user.added').then(() => user);
            })
            .then(user => res.status('202').json(user));
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
            return Users.updateUser(userId, req.body, true).then(user =>
            {
                if(req.query.tokenUpdate == "true")
                {
                    return doUserCacheUpdate(user, req.opuscapita.serviceClient)
                        .then(() => this.events.emit(user, 'user.updated'))
                        .then(() => res.status('202').json(user))
                        .catch(e => res.status('424').json({ message : e.message }))
                }
                else
                {
                    return this.events.emit(user, 'user.updated')
                        .then(() => res.status('202').json(user));
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

module.exports.addOrUpdateUserProfile = function(req, res, useCurrentUser)
{
    var userId = useCurrentUser ? req.opuscapita.userData('id') : req.params.id;

    Users.userExists(userId).then(exists =>
    {
        if(exists)
        {
            return Users.addOrUpdateUserProfile(userId, req.body, true).then(profile =>
            {
                if(req.query.tokenUpdate == "true")
                {
                    return Users.getUserProfile(userId).then(user =>
                    {
                        return doUserCacheUpdate(user, req.opuscapita.serviceClient)
                            .then(() => this.events.emit(profile, 'user/profile.updated'))
                            .then(() => res.status('202').json(profile))
                            .catch(e => res.status('424').json({ message : e.message }))
                    });
                }
                else
                {
                    return this.events.emit(profile, 'user/profile.updated')
                        .then(() => res.status('202').json(profile));
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
    var searchObj = { };

    if(req.query.customerId)
        searchObj.customerId = req.query.customerId;
    if(req.query.supplierId)
        searchObj.supplierId = req.query.supplierId;

    Users.getUsers(searchObj).then(users => res.json(users));
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
    Users.addUserRoles(req.body, true).then(roles =>
    {
        res.json(roles)
    })
    .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.addUserToRole = function(req, res)
{
    const userId = req.params.userId;
    const roleId = req.params.roleId;

    Users.userExists(userId).then(exists =>
    {
        if(exists)
        {
            Users.userRoleExists(roleId).then(roleExists =>
            {
                if(roleExists)
                    Users.addUserToRole(userId, roleId, true).then(roles => res.status('201').json(roles));
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
    let userDetails = {
        firstName: req.body.contactFirstName,
        lastName: req.body.contactLastName,
        email: req.body.email,
        campaignId: req.body.campaignId
    };
    let tradingPartnerDetails = {
        name: req.body.companyName,
        vatIdentNo: req.body.vatIdentNo,
        taxIdentNo: req.body.taxIdentNo,
        dunsNo: req.body.dunsNo,
        commercialRegisterNo: req.body.commercialRegisterNo,
        city: req.body.city,
        country: req.body.country
    };
    if (!req.body.campaignTool) {
        res.status('400').json({ message : "campaignTool field not specified" })
    } else {
        return UserOnboardData.create(userDetails, tradingPartnerDetails, req.body.campaignTool)
            .then(onboardingdata => res.status('202').json(onboardingdata))
            .catch(e => res.status('400').json({ message : e.message }));
    }
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
module.exports.getOnboardingData = function (req, res) {
  try {
      let filter = parseFilter(req.query.filter, ["invitationCode", "userId"], ["eq"])
      let fieldName = filter[0]
      let value = filter[2]

      if (fieldName == "invitationCode") {
          UserOnboardData.findByInvitationCode(value)
          .then(onboardingdata => {
              (onboardingdata && res.json(onboardingdata)) || res.status(404).json({message: 'No record found for InvitationCode = "' + value})
          });
      }
      else {
          UserOnboardData.findByUserId(value)
          .then(onboardingdata => {
              (onboardingdata && res.json(onboardingdata)) || res.status(404).json({message: 'No record found for UserId = "' + value})
          });
      }
  }
  catch(err) {
      res.status('400').json({ message : 'A valid query parameter "filter" is required.'});
  }
}

module.exports.updateOnboarddataUseridByInvitationcode = function(req, res)
{
    let invitationCode = req.params.invitationCode;
    let data = {
        userId: req.body.userId
    };

  return UserOnboardData.updateByInvitationCode(invitationCode, data)
    .then(onboardingdata => res.status('202').json(onboardingdata))
    .catch(e => res.status('400').json({ message : e.message }));
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
function parseFilter(filter, allowedFields, allowedOperators) {

    if (filter) {
        var filterArray = filter.split([' '])

        if (filterArray.length == 3 && allowedFields.includes(filterArray[0]) && allowedOperators.includes(filterArray[1])) {
            return filterArray
        }
        else {
            throw new Error("Filter not of required format.")
        }
    }
    else {
        throw new Error("Filter is missing")
    }
}


function doUserCacheUpdate(userObj, serviceClient)
{
    return serviceClient.post('kong', '/refreshIdToken', userObj);
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
