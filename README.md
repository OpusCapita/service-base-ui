# ocbesbn-user
![Build status](https://circleci.com/gh/OpusCapita/db-init.svg?style=shield&circle-token=991b64f8600ad273b673dc94799ec0ccca772d1c)

# Deployment
## Swarm
```
docker service create --publish mode=host,target=3008,published=3008 --host consul:172.17.0.1 --log-driver gelf --log-opt gelf-address=udp://10.0.0.12:12201 --env SERVICE_3008_CHECK_HTTP=/ --env SERVICE_3008_CHECK_INTERVAL=15s --env SERVICE_3008_CHECK_TIMEOUT=3s opuscapita/user:dev
```