FROM node:12-alpine

RUN apk add --no-cache curl

WORKDIR /home/node/service-base-ui
COPY . .

ENV NODE_ENV=development NODE_PATH=/home/node/node_modules PATH=${PATH}:${NODE_PATH}/.bin
RUN npm install && npm cache clean --force

# A container must expose a port if it wants to be registered in Consul by Registrator.
# The port is fed both to node express server and Consul => DRY principle is observed with ENV VAR.
# NOTE: a port can be any, not necessarily different from exposed ports of other containers.
EXPOSE 3300

HEALTHCHECK --interval=15s --timeout=3s --retries=12 \
  CMD curl --silent --fail http://localhost:3300/api/health/check || exit 1

CMD [ "npm", "start" ]
