var io = require('socket.io');

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
          if(message.type == "userMessage"){
            console.log("The type of the event is a userMessage" );
            //socket.emit('serverevent', {type : "servermessage", message : "The server says hi back"})
            //socket.broadcast.emit('serverevent', {type : "servermessage", message : "Someone says hi to all"})
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
