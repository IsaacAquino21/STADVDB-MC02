const express = require('express')
const path = require('path')

const controller = require('../controllers/controller');

const app = express();
app.set('views', path.join(__dirname, '../views'));

// get methods
app.get('/', controller.getHome)
app.get('/movie-page/:id/:year', controller.getMoviePage)


// post methods
// app.post('/test', controller.postReadOneMovie)


module.exports = app;