FROM node:12.4.0

LABEL maintainer="Luca Perret <perret.luca@gmail.com>" \
      org.label-schema.vendor="Strapi" \
      org.label-schema.name="Strapi Docker image" \
      org.label-schema.description="Strapi containerized" \
      org.label-schema.url="https://strapi.io" \
      org.label-schema.vcs-url="https://github.com/strapi/strapi-docker" \
      org.label-schema.version=latest \
      org.label-schema.schema-version="1.0"

WORKDIR /usr/src/app

RUN echo "unsafe-perm = true" >> ~/.npmrc

# Express setup
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000 1337

# Strapi setup
RUN npm install -g strapi@beta

#COPY strapi.sh ./ # we should not need this...
RUN chmod +x ./strapi.sh

COPY healthcheck.js ./
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s \
      CMD node /usr/src/api/healthcheck.js

CMD ["npm", "start"]
