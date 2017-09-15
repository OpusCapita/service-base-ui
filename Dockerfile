FROM opuscapita/user:base
MAINTAINER kwierchris

WORKDIR /var/tmp/base
COPY package.json .

# Make sure node can load modules from /var/tmp/base/node_modules
# Setting NODE_ENV is necessary for "npm install" below.
ENV NODE_ENV=development NODE_PATH=/var/tmp/base/node_modules PATH=${PATH}:${NODE_PATH}/.bin
RUN yarn

WORKDIR /home/node/user

# Bundle app source by overwriting all WORKDIR content.
COPY . .

RUN npm run build:client

# Set the user name or UID to use when running the image and for any RUN, CMD and ENTRYPOINT instructions that follow
USER node

# A container must expose a port if it wants to be registered in Consul by Registrator.
# The port is fed both to node express server and Consul => DRY principle is observed with ENV VAR.
# NOTE: a port can be any, not necessarily different from exposed ports of other containers.
EXPOSE 3008

CMD [ "npm", "start" ]
HEALTHCHECK --interval=15s --timeout=3s --retries=12 \
  CMD curl --silent --fail http://localhost:3008/api/health/check || exit 1
