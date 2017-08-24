FROM node:boron

COPY . /home/dev-hyperty

# Change the work directory
WORKDIR /home/dev-hyperty

# preinstall
RUN node bin/preinstall
