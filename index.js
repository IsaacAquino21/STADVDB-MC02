const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const exphbs = require('express-handlebars');
const cors = require('cors')
const bodyParser = require('body-parser');

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
})

const app = express();

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.engine('hbs', hbs.engine)
app.set('view engine', '.hbs')
app.use(express.static(path.join(__dirname, '/public')))

const routes = require('./routes/routes');
const config = require('./config')

dotenv.config();
port = process.env.PORT;
hostname = process.env.HOSTNAME;

// routes
app.use('/', routes)

app.listen(config.port, config.host, () => {
    console.log('Listening to ' + config.host + ':' + config.port)
})

module.exports = app