# FROM node:9-alpine
FROM node:8.11.1

ENV CORE_DEPS apt-transport-https gnupg
ENV WATCHMAN_DEPS python-dev
ENV TESTING_DEPS google-chrome-stable
ENV BUILD_DEPS ""

# Install chrome and watchman deps
RUN echo \
	&& apt-get update \
	&& apt-get install -y $CORE_DEPS $WATCHMAN_DEPS --no-install-recommends \
  && curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update \
  && apt-get install -y $TESTING_DEPS $BUILD_DEPS --no-install-recommends

# Install watchman
# Not installed due to the default fs.inotify.max_user_watches boing too low
# RUN echo \
# 	&& git clone https://github.com/facebook/watchman.git \
# 	&& cd watchman \
# 	&& git checkout v4.9.0 \
# 	&& ./autogen.sh \
# 	&& ./configure \
# 	&& make \
# 	&& make install

RUN mkdir -p /app
WORKDIR /app

# install npm (for security updates), and ember-cli
RUN echo \
  && npm install --global npm@latest

CMD ["yarn", "start"]
