var io = require('socket.io');

//Kafka consumer init , code for connecting to a KAfka server, at this moment hard coded to a kafka poc server in aws (todo change within app)

var kafka = require('kafka-node');
var Client = kafka.Client;
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var clientConnected = null
var consumerConnected = null

//Ask Kafka client to show topics , will be send to socket browser
function getTopics(client,socket) {
    client.on('connect', function (message) {
        console.log("kafka cliented connect for topic retrieval" );
        client.loadMetadataForTopics([], (err, resp) => {
          result=resp
          socket.emit('serverevent', {type : "kafkatopics", message : result})
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
    consumerConnected = consumer
}

//End of Kafka code


//Start the socket server
exports.initialize = function(server) {
  io = io.listen(server);

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
          else if(message.type == "disconnectKafkaConsumer"){
            console.log("Client wants server to disconnect Kafka client" );
            if (clientConnected != null) {
              if (consumerConnected != null) {
                //End  consumer , commit is true
                consumerConnected.close(true, function () {
                  console.log("Consumer closed" );
                  consumerConnected = null
                  clientConnected.close(function() {
                    console.log("Client was disconnected")
                    clientConnected = null
                  })
                });
              }
            }
          }
          else if(message.type == "startConsumeTopic"){
            console.log("Client wants to consume a topic: " + message.topic );
            createClient(message.zooKeeper,socket)

            if (clientConnected != null) {
              console.log("KAfka client is already connected, starting consumer" );
              if (consumerConnected != null) {
                //End  consumer , commit is true
                consumerConnected.close(true, function () {
                  console.log("Closing existing consumer first, opening new" );
                  consumerConnected = null
                  createConsumer(clientConnected, message.topic,socket)
                })
              }
              else {
                console.log("New consumer creating" );
                createConsumer(clientConnected, message.topic,socket)
              }
            }
            /*
            else {
              //No client anymore, create it
              console.log("Client KAfka reconnecting" );
              createClient(message.zooKeeper,socket)

              if (consumerConnected != null) {
                //End  consumer , commit is true
                consumerConnected.close(true, function () {
                  console.log("Closing existing consumer first, opening new" );
                  consumerConnected = null
                  createConsumer(clientConnected, message.topic,socket)
                })
              }
              else {
                console.log("New consumer creating" );
                createConsumer(clientConnected, message.topic,socket)
              }

            }
            */

          }
        });

  });
}
