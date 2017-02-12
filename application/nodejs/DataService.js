var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
path = require('path');

//Kafka consumer code connecting to a KAfka server, at this moment hard coded to a kafka poc server in aws (todo change within app)
let zooKeeper = "52.209.29.218:2181/"
let topic = 'ciss'

var kafka = require('kafka-node');
var Consumer = kafka.Consumer;
var Producer = kafka.Producer;
var Offset = kafka.Offset;
var Client = kafka.Client;

var client = new Client(zooKeeper);
//var client = new Client('172.31.20.95:2181/');
var topics = [
        {topic: topic, partition:0},
    ],
    options = { autoCommit: false, fromBeginning: true, fetchMaxWaitMs: 1000 };

function createConsumer(topics) {
    var consumer = new Consumer(client, topics, options);
    var offset = new Offset(client);
    consumer.on('message', function (message) {
        console.log(this.id, message);
    });
    consumer.on('error', function (err) {
        console.log('error', err);
    });
    consumer.on('offsetOutOfRange', function (topic) {
        topic.maxNum = 2;
        offset.fetch([topic], function (err, offsets) {
            var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
            consumer.setOffset(topic.topic, topic.partition, min);
        });
    })
}

createConsumer(topics);

//End of Kafka code

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

//Backend, use socket client on localhost port 80
var http = require('http');
var server = http.createServer(app).listen(80, function(){
  console.log("Express server listening on port 80" );
   });
require('./routes/socket_server.js').initialize(server);

// frontend for the commander application, url: http://localhost/commander
app.get('/admiral', function(req, res) {

    app.use(express.static(__dirname + "\\.."));
    if (!req.files)
      res.sendFile(path.join(__dirname + "\\..\\" + 'index.html'));
    else
      res.sendFile(path.join(__dirname + "\\..\\" + req.files));
});

//All other url's , like http://localhost will use the index.html at the static location we set (/../../website)

module.exports = app;
