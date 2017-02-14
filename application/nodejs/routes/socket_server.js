var io = require('socket.io');

//Kafka consumer init , code for connecting to a KAfka server, at this moment hard coded to a kafka poc server in aws (todo change within app)

var kafka = require('kafka-node');
var Client = kafka.Client;
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var clientConnected = null

function getTopics(zooKeeper) {
    let client = new Client(zooKeeper);

    //error : BrokerNotAvailableError: Broker not available
    //client.loadMetadataForTopics(['ciss'], function (error, results) {
    //  console.log("results : " + results);
    //  console.log("error : " + error);
    //});

    client.loadMetadataForTopics(["ciss"], (err, resp) => {
      console.log(JSON.stringify(err))
      console.log(JSON.stringify(resp))
  });


}

function createClient(zooKeeper) {
  clientConnected = new Client(zooKeeper)
}

function createConsumer(client, myTopics,socket) {

    let topics = [
          {topic: myTopics, partition:0},
      ],
      options = { autoCommit: false, fromBeginning: false, fetchMaxWaitMs: 1000 };

    let consumer = new Consumer(client, topics, options);
    let offset = new Offset(client);
    consumer.on('message', function (message) {
        console.log("Kafka message received, sending it to client browser:" );
        console.log(this.id, message);
        socket.emit('serverevent', {type : "kafkamessage", message : message})

    });
    consumer.on('error', function (err) {
        console.log('There was a kafka error', err);
        socket.emit('serverevent', {type : "kafkamessage", message : err})
    });
    consumer.on('offsetOutOfRange', function (topic) {
        topic.maxNum = 2;
        offset.fetch([topic], function (err, offsets) {
            var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
            consumer.setOffset(topic.topic, topic.partition, min);
        });
    })
}

//End of Kafka code


//Start the socket server
exports.initialize = function(server) {
  io = io.listen(server);
  //io.sockets.emit('serverevent', {type : "resetclients"})
  //socket.broadcast.emit('serverevent', {type : "removeUser", user: player})

  //Loop needed?
  //setInterval(function(){
  //}, 10);  //10 ms loop (so 10* 1/1000th of a sec)

  //server receives connect event from client
  io.sockets.on("connection", function(socket){
    console.log("Client is connected to server using socket id " + String(socket.id) );

    socket.on("disconnect",function(){

    })

    //server receives custom event from client
    socket.on('clientmessage', function(message){

          //A user sends a text message
          if(message.type == "connectKafkaConsumer"){
            console.log("The type of the event recevied from browser is a connectKafkaConsumer" );

            if (clientConnected == null) createClient(message.zooKeeper)

            if (clientConnected != null) createConsumer(clientConnected ,message.topic,socket);
            //getTopics(message.zooKeeper)

          }

          //After initial connect this will let the new user know its properties, were to start etc.
          else if(message.type == "userHandshake"){
            //console.log("At time " + counter + " the user " + message.user + " wants to play. Adding to slot and reply with handshake");
            //socket.emit('serverevent', {type : "serverHandshake", user: newplayer})
            //socket.broadcast.emit('serverevent', {type : "positions", players: players })
            //socket.emit('serverevent', {type : "positions", players: players })

          }

        });

  });
}
