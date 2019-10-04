FROM node:12.4.0

WORKDIR /usr/src/app

RUN echo "unsafe-perm = true" >> ~/.npmrc

# Bundle app source
COPY . .
COPY . /usr/src/app

# Express setup
COPY package.json .
COPY package-lock.json .
RUN npm install


EXPOSE 3000 1337

# Strapi setup
RUN npm install -g strapi@beta

#COPY strapi.sh ./ # we should not need this...
RUN chmod +x ./strapi.sh

RUN npm build

COPY healthcheck.js ./
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s \
      CMD node /usr/src/api/healthcheck.js

CMD ["npm", "start"]
