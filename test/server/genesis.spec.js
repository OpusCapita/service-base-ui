'use strict'

const assert = require('assert');
const Promise = require('bluebird');
const ServiceClient = require('ocbesbn-service-client');

require(process.cwd() + '/src/server/index.js');

describe("main", () =>
{
    /*
    const clientConfig = { consul : { host : 'consul' } };
    var client = new ServiceClient(clientConfig);

    describe('GET', () =>
    {
        it("get users", (done) =>
        {
            Promise.resolve().delay(1000).then(() =>
            {
                var result;

                client.get('user', '/users').then(users => result = users).finally(() =>
                {
                    assert.equal(JSON.stringify(result), '[{"id":"abc:user","federationId":"abc","supplierId":"42","customerId":null,"status":"firstLogin","mayChangeSupplier":true,"mayChangeCustomer":true,"createdBy":"the doctor","changedBy":"","createdOn":"2017-04-06T12:04:17.000Z","changedOn":"2017-04-06T12:04:17.000Z"}]');
                    done();
                });
            });
        });

        it("get user", (done) =>
        {
            Promise.resolve().delay(1000).then(() =>
            {
                var result;

                client.get('user', '/users/abc:user').then(user => result = user).finally(() =>
                {
                    assert.equal(JSON.stringify(result), '{"id":"abc:user","federationId":"abc","supplierId":"42","customerId":null,"status":"firstLogin","mayChangeSupplier":true,"mayChangeCustomer":true,"createdBy":"the doctor","changedBy":"","createdOn":"2017-04-06T12:04:17.000Z","changedOn":"2017-04-06T12:04:17.000Z"}');
                    done();
                });
            });
        });

        it("get user profile", (done) =>
        {
            Promise.resolve().delay(1000).then(() =>
            {
                var result;

                client.get('user', '/users/abc:user/profile').then(profile => result = profile).finally(() =>
                {
                    assert.equal(JSON.stringify(result), '{"userId":"abc:user","email":"user@domain.com","languageId":"de","countryId":"DE","timeZoneId":"CET","salutation":"Mr","firstName":"Foo","lastName":"Bar","birthday":"1971-01-01T00:00:00.000Z","degree":"","phoneNo":"+49123456789","faxNo":"","department":"Foobar","building":"","floor":"1st","room":"88","createdBy":"the doctor","changedBy":"","createdOn":"2017-04-06T12:04:17.000Z","changedOn":null}');
                    done();
                });
            });
        });
    });

    /*
    describe('POST', () =>
    {
        it("add user", (done) =>
        {
            Promise.resolve().delay(1000).then(() =>
            {
                var user = JSON.parse('{"id":"bcd:user","federationId":"bcd","supplierId":"42","customerId":null,"status":"firstLogin","mayChangeSupplier":true,"mayChangeCustomer":true,"createdBy":"the doctor","changedBy":""}');
                var result;

                client.post('user', '/users', user).then(res => result = res).finally(() =>
                {
                    delete result.createdOn;
                    delete result.changedOn;

                    assert.equal(JSON.stringify(result), JSON.stringify(user));
                    done();
                });
            });
        });
    });
    */
});
