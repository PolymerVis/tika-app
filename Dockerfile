FROM nginx:alpine
MAINTAINER eterna2 <eterna2@hotmail.com>

ARG tika_version=1.17
ENV TIKA_VERSION=$tika_version
ENV TIKA_SERVER_URL=https://www.apache.org/dist/tika/tika-server-$tika_version.jar

# gdal package is at edge branch
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories

RUN apk --update --no-cache add \
        openjdk8-jre-base \
        tesseract-ocr \
        tesseract-ocr-data-enm \
        gdal

RUN apk --update add --virtual build-dependencies curl gnupg \
    && curl -sSL https://people.apache.org/keys/group/tika.asc -o /tmp/tika.asc \
    && gpg --import /tmp/tika.asc \
  	&& curl -sSL "$TIKA_SERVER_URL.asc" -o /tmp/tika-server-${TIKA_VERSION}.jar.asc \
  	&& NEAREST_TIKA_SERVER_URL=$(curl -sSL http://www.apache.org/dyn/closer.cgi/${TIKA_SERVER_URL#https://www.apache.org/dist/}\?asjson\=1 \
  		| awk '/"path_info": / { pi=$2; }; /"preferred":/ { pref=$2; }; END { print pref " " pi; };' \
  		| sed -r -e 's/^"//; s/",$//; s/" "//') \
  	&& echo "Nearest mirror: $NEAREST_TIKA_SERVER_URL" \
  	&& curl -sSL "$NEAREST_TIKA_SERVER_URL" -o /tika-server-${TIKA_VERSION}.jar \
    && apk del build-dependencies

EXPOSE 80
EXPOSE 443

COPY ./nginx/* /etc/nginx/
COPY ./nginx/includes /etc/nginx/includes
COPY ./nginx/cert /etc/nginx/ssl
COPY ./build/default /var/www

COPY start.sh /scripts/
RUN chmod +x /scripts/start.sh

CMD ["./scripts/start.sh"]
