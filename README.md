tika-app
===
[![Polymer version](https://img.shields.io/badge/polymer-3.0.0--pre.12-blue.svg)](https://shields.io/)
[![Build Status](https://travis-ci.org/PolymerVis/tika-app.svg?branch=master)](https://travis-ci.org/PolymerVis/tika-app)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

`tika-app` is a Polymer 3 app for [Apache Tika](https://tika.apache.org/), where text and meta-data can be extracted from various formats (e.g. `doc`, `docx`, `pdf`, `images`, ...).

The demo is hosted at  [Heroku](https://tika-app.herokuapp.com).

## Quick start
```bash
# clone repo
git clone git@github.com:PolymerVis/tika-app.git
# enter tika-app project folder
cd tika-app
# install dependencies
npm install
# build app
npm run build:polymer
# build docker images
docker-compose build
# run service with docker-compose
docker-compose up
```
