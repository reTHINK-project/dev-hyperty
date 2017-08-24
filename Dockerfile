FROM node:boron

RUN mkdir /opt; cd /opt; mkdir reTHINK; cd reTHINK; mkdir dev-hyperty;

COPY . /opt/reTHINK/dev-hyperty

# Change the work directory
WORKDIR /opt/reTHINK/dev-hyperty

# Install app dependencies
RUN npm install
