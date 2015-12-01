FROM node:4.2

MAINTAINER Alban Mouton <alban.mouton@gmail.com>

# Install the heaviest dependencies separately and early in Dockerfile so that
# they can be cached by docker and reinstalled as few times as possible
WORKDIR /tmp
RUN wget http://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64.tar.bz2
RUN tar xvjf phantomjs-1.9.8-linux-x86_64.tar.bz2
RUN install -t /usr/local/bin phantomjs-1.9.8-linux-x86_64/bin/phantomjs
RUN rm -rf phantomjs-1.9.8-linux-x86_64
RUN rm phantomjs-1.9.8-linux-x86_64.tar.bz2

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app/

EXPOSE 3111

CMD node app.js
