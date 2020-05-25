#!/usr/bin/env sh

export NGINX_LISTENING_PORT=${PORT:-80}
export VARS_TO_REPLACE='$NGINX_LISTENING_PORT'

if [ "$NGINX_CONF_DIR" = "" ]
then
	NGINX_CONF_DIR=/etc/nginx/conf.d
fi

envsubst "$VARS_TO_REPLACE" < $NGINX_CONF_DIR/default.conf.template > $NGINX_CONF_DIR/default.conf
cat $NGINX_CONF_DIR/default.conf

echo "Starting emberclear..."
nginx -g 'daemon off;'
