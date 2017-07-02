# user
![Build status](https://circleci.com/gh/OpusCapita/user.svg?style=shield&circle-token=991b64f8600ad273b673dc94799ec0ccca772d1c)

Please have a look at the [wiki](../../wiki).

# Deployment
## Swarm
Is auto - built now

Deprecated
```
docker service create --name user --publish mode=host,target=3008,published=3008 --host consul:172.17.0.1 --log-driver gelf --log-opt gelf-address=udp://10.0.0.12:12201 --log-opt tag="user" --env PORT=3008 --env SERVICE_NAME=user --env SERVICE_3008_CHECK_HTTP=/users/scott.tiger@example.com --env SERVICE_3008_CHECK_INTERVAL=15s --env SERVICE_3008_CHECK_TIMEOUT=3s opuscapita/user:dev
```

# User lifecycle

## Self-Registration
Users are created via auth service, registration routes.
Status:
* emailVerification - this means user has been sent a confirmation email but not confirmed yet. user is not able to login in this status
* emailVerified - once email is confirmed, the user is able to login but usually has no tenant assigned and hence also cannot do anything on the portal other then registering a company via bnp/supplierRegistration. The communication to apis is limited on kong level by tenant check lus function
* registered - this will be set by supplier once the user is assigned to a supplier tenant, the user also gains the role of supplier-admin in this step
