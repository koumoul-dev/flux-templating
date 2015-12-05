FROM albanm/flux-templating-docker

MAINTAINER Alban Mouton <alban.mouton@gmail.com>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app/

EXPOSE 3111

CMD node server.js
