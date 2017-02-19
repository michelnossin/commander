var io = require('socket.io');

//Kafka consumer init , code for connecting to a KAfka server, at this moment hard coded to a kafka poc server in aws (todo change within app)

var kafka = require('kafka-node');
var Client = kafka.Client;
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var clientConnected = null

//Ask Kafka client to show topics , will be send to socket browser
function getTopics(client,socket) {
    //let client = new Client(zooKeeper);
    client.on('connect', function (message) {
        console.log("kafka cliented connect for topic retrieval" );

        client.loadMetadataForTopics([], (err, resp) => {
          //console.log(JSON.stringify(err))
          //result = JSON.stringify(resp)
          result=resp
          socket.emit('serverevent', {type : "kafkatopics", message : result})
          //console.log("topics list send to socket, browser client: " + result)

      });

    });

}

//Create , and keep open, a kafka client. Which can be used to create consumer or producer
function createClient(zooKeeper,socket) {
  clientConnected = new Client(zooKeeper)
  getTopics(clientConnected,socket)
}

//Create Kafka consumer
function createConsumer(client, myTopics,socket) {

    let topics = [
          {topic: myTopics, partition:0},
      ],
      options = { autoCommit: true, fromOffset: false, fetchMaxWaitMs: 1000 }; //options = { autoCommit: false, fromBeginning: false, fetchMaxWaitMs: 1000 };

    //let consumer = new Consumer(client, topics, options);
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

            //Client is required for any interaction
            if (clientConnected == null) createClient(message.zooKeeper,socket)
          }
          if(message.type == "disconnectKafkaConsumer"){
            console.log("Client wants server to disconnect Kafka client" );
            if (clientConnected != null) {
              clientConnected.close(function() {
                console.log("Client was disconnected")
                clientConnected = null
              })
            }
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
