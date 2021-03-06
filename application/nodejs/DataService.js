var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
path = require('path');

//Config the app
var app = express();
app.use(express.static(__dirname + '/../../website'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//Backend, use socket client on <host> port 80
var http = require('http');
var server = http.createServer(app).listen(80, function(){
  console.log("Express server listening on port 80" );
   });
require('./routes/socket_server.js').initialize(server);

// frontend for the commander application, url: http://<host>/admiral
app.get('/admiral', function(req, res) {

    app.use(express.static(__dirname + "\\.."));
    if (!req.files)
      res.sendFile(path.join(__dirname + "\\..\\" + 'index.html'));
    else
      res.sendFile(path.join(__dirname + "\\..\\" + req.files));
});

//All other url's , like http://localhost will use the index.html at the static location we set (/../../website)

module.exports = app;
