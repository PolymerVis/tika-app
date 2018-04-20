#!/bin/bash
docker build -t registry.heroku.com/tika-app/web .
docker push registry.heroku.com/tika-app/web
