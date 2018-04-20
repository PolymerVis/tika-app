#!/bin/sh
if [[ $PORT ]]
then
  echo "Starting Heroku service"
  sed "s/#PORT#/$PORT/" /etc/nginx/nginx.heroku.conf > /etc/nginx/nginx.conf
else
  echo "Starting Local Docker service"
  cp /etc/nginx/nginx.local.conf /etc/nginx/nginx.conf
fi
echo "Starting tika server $TIKA_VERSION"
java -jar /tika-server-$TIKA_VERSION.jar -h 127.0.0.1 &
echo "Starting nginx $NGINX_VERSION"
nginx -g 'daemon off;'
