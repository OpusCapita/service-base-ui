'use strict'

const Promise = require('bluebird');
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
    return Users.init(db, config)
    .then(() =>
    {
        return UserOnboardData.init(db, config);
    })
    .then(() =>
    {
        this.events = new RedisEvents({ consul : { host : 'consul' } });

        app.use(checkContentType);

        app.get('/register/verify/:email', (req, res) => this.verifyRegister(req, res));
        app.post('/register/verify', (req, res) => this.postVerifyRegister(req, res));

        app.get('/register', (req, res) => this.registerUser(req, res));
        app.post('/register', (req, res) => this.postRegister(req, res));

        /* duplicate endpoint for backwards compatibility */
        app.get(['/onboardData/:id', '/onboardingdata/:id'], (req, res) => this.getOnboardData(req, res));

        app.get('/onboardingdata/:invitationcode', (req, res) => this.sendOnboardingData(req, res));
        app.post('/onboardingdata', (req, res) => this.addOnboardingData(req, res));

        app.get('/users', (req, res) => this.sendUsers(req, res));
        app.post('/users', (req, res) => this.addUser(req, res));

        app.get('/users/:id', (req, res) => this.sendUser(req, res));
        app.put('/users/:id', (req, res) => this.updateUser(req, res));

        app.get('/users/:id/profile', (req, res) => this.sendUserProfile(req, res));
        app.put('/users/:id/profile', (req, res) => this.addOrUpdateUserProfile(req, res));

        app.get('/roles', (req, res) => this.sendRoles(req, res));
        app.get('/roles/:id', (req, res) => this.sendRole(req, res));
    });
}

module.exports.registerUser = function(req, res)
{
  let userDetail = (req.query.userDetail) ? JSON.parse(req.query.userDetail) : {};
  let invitationCode = req.query.invitationCode;

  if (invitationCode) {
      UserOnboardData.findByInvitationCode(invitationCode).then((onboardData) => {
          if (!onboardData) {
            let msg = {errMessage: "No invitation found."};
            res.render('registration', msg);
          } else {
              let userDetails = JSON.parse(onboardData.userDetails);

              res.render('registration', {
                  password: '',
                  errMessage: '',
                  email: userDetails.email || '',
                  serviceName: userDetails.serviceName || '',
                  userDetails: onboardData.userDetails || '',
                  tradingPartnerDetails: onboardData.tradingPartnerDetails || ''
              })
          }
      })
  } else {
      res.render('registration', {
          password: '',
          errMessage: '',
          email: userDetail.email || '',
          serviceName: req.query.serviceName ? req.query.serviceName : (userDetail ? userDetail.serviceName : ''),
          userDetails: req.query.userDetail || '',
          tradingPartnerDetails: req.query.tradingPartnerDetails || ''
      })
  }
}

module.exports.postRegister = function(req, res)
{
  var msg = {
    email: req.body.email,
    password: req.body.password,
    errMessage: '',
    serviceName: req.body.serviceName,
    userDetails: req.body.userDetails || '',
    tradingPartnerDetails: req.body.tradingPartnerDetails || ''
  }

  function validateUser() {
    return new Promise((resolve, reject) => {
      Users.userExists(req.body.email).then((exists) => {
        if(exists) {
          return reject({message: 'User already exists'});
        }

        return resolve({statusCode: 200, message: ''});
      })
    });
  }

  validateUser()
  .then(() => {
    return req.ocbesbn.serviceClient.post('kong', '/auth/credentials', {
      email: req.body.email,
      password: req.body.password
    });
  })
  .then((data) => {
    return Users.addUser({
      id: req.body.email,
      status: 'emailVerification'
    }, true)
    .then(user => this.events.emit(user, 'user.added'));
  })
  .then(() => {
    if(req.body.userDetails) {
      let userDetails = JSON.parse(req.body.userDetails);
      return UserOnboardData.create({
        userId: req.body.email || '',
        userDetails: req.body.userDetails || '',
        invitationCode: userDetails.invitationCode || null,
        serviceName: req.body.serviceName || '',
        tradingPartnerDetails: req.body.tradingPartnerDetails || ''
      });
    }
    return new Promise.resolve();
  })
  .then(() => {
    res.redirect('/user/register/verify/' + req.body.email);
  })
  .catch((err) => {
    if (err && err.message)
      msg.errMessage = err.message;
    else
      msg.errMessage = 'Oops!, something went wrong';

    res.render('registration', msg);
  });
}

module.exports.verifyRegister = function(req, res)
{
  res.render('registration-confirm', {
    invalidCode: '',
    userId: req.params.email,
    email: req.params.email
  });
}

module.exports.postVerifyRegister = function(req, res)
{
  req.ocbesbn.serviceClient.post('kong', '/auth/credentials/verify/email', {
    email: req.body.email,
    code: req.body.code
  }).then(() => {
    res.render('registration-valid', {
      userId: req.body.email
    })
  }).catch((err) => {
    res.render('registration-confirm', {
      invalidCode: err.message,
      userId: req.body.email,
      email: req.body.email
    });
  })

}

module.exports.getOnboardData = function(req, res)
{
  UserOnboardData.find(req.params.id).then((userData) => {
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
                .then(user => this.events.emit(user, 'user.added').then(() => user))
                .then(user => res.status('202').json(user));
        }
    })
    .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.updateUser = function(req, res)
{
    Users.userExists(req.params.id).then(exists =>
    {
        if(exists)
        {
            return Users.updateUser(req.params.id, req.body, true).then(user =>
            {
                if(req.query.tokenUpdate == "true")
                {
                    return doUserCacheUpdate(user, req.ocbesbn.serviceClient)
                        .then(() => this.events.emit(user, 'user.updated'))
                        .then(() =>  res.status('202').json(user))
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

module.exports.addOrUpdateUserProfile = function(req, res)
{
    Users.userExists(req.params.id).then(exists =>
    {
        if(exists)
        {
            return Users.addOrUpdateUserProfile(req.params.id, req.body, true).then(profile =>
            {
                if(req.query.tokenUpdate == "true")
                {
                    return Users.getUserProfile(req.params.id).then(user =>
                    {
                        return doUserCacheUpdate(user, req.ocbesbn.serviceClient)
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
    Users.getUsers().then(users =>
    {
        res.json(users);
    });
}

module.exports.sendUser = function(req, res)
{
    Users.getUser(req.params.id).then(user =>
    {
        (user && res.json(user)) || res.status('404').json({ message : 'User does not exist!' });
    });
}

module.exports.sendUserProfile = function(req, res)
{
    Users.getUserProfile(req.params.id).then(profile =>
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
    return UserOnboardData.create(userDetails, tradingPartnerDetails)
        .then(onboardingdata => res.status('202').json(onboardingdata))
        .catch(e => res.status('400').json({ message : e.message }));
}

module.exports.sendOnboardingData = function(req, res)
{
    UserOnboardData.findByInvitationCode(req.params.invitationcode).then(onboardingdata =>
    {
        (onboardingdata && res.json(onboardingdata)) || res.status('404').json({ message : 'Onboarding data does not exist!' });
    });
}

function doUserCacheUpdate(userObj, serviceClient)
{
    return serviceClient.post('kong', '/refreshIdToken', userObj);
}

function checkContentType(req, res, next)
{
    var method = req.method.toLowerCase();
    var contentType = req.headers['content-type'] && req.headers['content-type'].toLowerCase();

    if(method !== 'get' && contentType !== 'application/json' && contentType !== 'application/x-www-form-urlencoded')
        res.status(400).json({ message : 'Invalid content type. Has to be "application/json" or "application/x-www-form-urlencoded".' });
    else
        next();
}
