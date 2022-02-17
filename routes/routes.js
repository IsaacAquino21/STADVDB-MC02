const express = require('express')
const path = require('path')

const controller = require('../controllers/controller');

const app = express();
app.set('views', path.join(__dirname, '../views'));

// get methods
app.get('/', controller.getHome)
app.get('/movie-page/:id/:year', controller.getMoviePage)

app.get('/movie-add', controller.getMovieAdd)



app.post('/add-movie', controller.postAddMovie)
app.post('/update-movie', controller.postUpdateMovie)
app.post('/delete-movie', controller.postDeleteMovie)


// post methods
// app.post('/test', controller.postReadOneMovie)


module.exports = app;