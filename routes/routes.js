const express = require('express')
const path = require('path')

const controller = require('../controllers/controller');

const app = express();
app.set('views', path.join(__dirname, '../views'));

app.get('/', controller.getHome)

module.exports = app;