const express = require("express");
const app     = express();
const path    = require('path');

var AWS = require('aws-sdk');
app.use(express.static(__dirname + '/public'))

app.use(express.urlencoded({
  extended: true
}))

//////////////////////////////////////////////////

var router = require('./router');
app.use('/', router);


const bodyParser = require('body-parser')
const http = require('http').Server(app)

// Inicializando Servidor
const porta = process.env.PORT || 8000

const host = process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : "http://localhost"

http.listen(porta, function(){
    const portaStr = porta === 80 ? '' :  ':' + porta

    if (process.env.HEROKU_APP_NAME) 
         console.log('Servidor iniciado. Abra o navegador em ' + host)
    else console.log('Servidor iniciado. Abra o navegador em ' + host + portaStr)
})

