import React from 'react';
import Line from './Line';
import io from 'socket.io-client'
let socket = io(`http://localhost`) //our server 192.168.0.105
var bgColors = { "Default": "#81b71a",
                    "Blue": "#00B1E1",
                    "Cyan": "#37BC9B",
                    "Green": "#8CC152",
                    "Red": "#E9573F",
                    "Yellow": "#F6BB42",
};

//let user = "user_" + Math.random().toString(36).substring(7); //Lets give the user a name, todo: let the user make this up
//console.log("Client is using this name: " + user  );

class Editor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        //event_msg: {}, //message from server
        //lines : []  //list of all non current lines
    };

    //this.sendMessage = this.sendMessage.bind(this)

    //receive event from server
    socket.on('serverevent', ev_msg => {
      if (ev_msg.type == 'servermessage') {
        //Some user send a text message.
        //this.receiveMessage(ev_msg.message)
      }
      //Init client based on server properties as determined
      else if (ev_msg.type == 'serverHandshake') {
        //this.resetClient()
        console.log("Server handshake received by client")
      }
    })
  }

  //shouldComponentUpdate(nextProps, nextState) {
  //  return false;
  //}

  //Call when windows resized.
  /*
  updateDimensions() {
        let orgWidth = this.state.width
        let orgHeight = this.state.height
        console.log("Width and Height resize to " + String(window.innerWidth) + " and " + String(window.innerHeight)  );
        let newWidth = window.innerWidth
        let newHeight = window.innerHeight
        //this.setState( { width :window.innerWidth, height: window.innerHeight })

        var positions = Object.assign({},this.state.position)

        Object.keys(positions).map((player,index) => {
          positions[player].x1 = (newWidth/orgWidth) * positions[player].x1
          positions[player].x2 = (newWidth/orgWidth) * positions[player].x2
          positions[player].y1 = (newHeight/orgHeight) * positions[player].y1
          positions[player].y2 = (newHeight/orgHeight) * positions[player].y2
        })

        this.setState( { position: positions , width :window.innerWidth, height: window.innerHeight})
    }
*/

  //Set current window size before starting
  componentWillMount () {
        //this.updateDimensions();
    }

  //client set timer, at this moment only used to simulate key events
  componentDidMount()  {

    var self = this;
    socket.on('connect', function (data) {
      console.log("Client was connected using socket id " + String(socket.id) );
      //socket.emit('clientmessage', { type: "userHandshake", user: user })
    });
    socket.on('disconnect', function() {
      console.log("Client was disconnected  " + String(socket.id)  );

    })
    window.addEventListener("resize", this.updateDimensions);
  }

  //remove any timers and listeners when client stops
  componentWillUnmount() {
    console.log("Client with was disconnected "  );
    //window.removeEventListener("resize", this.updateDimensions);
  }


  //Send event message to server, for example to let others know we change our line direction
  sendMessage(message) {
    socket.emit('clientmessage', message)
  }

  render() {
    var username=""

    return (
      <div className="Editor">This is commander</div>
    );
/*
    return (
      <div className="Lineio" >
      { Object.keys(this.state.position).map((username,index) => (
      <Line key={index}
      from={{x: this.state.position[username].x1, y: this.state.position[username].y1}}
      to={{x: this.state.position[username].x2, y: this.state.position[username].y2}} style={this.state.position[username].styling}/>
    ))}
       <footer>{this.state.event_msg.message}</footer>
       </div>
    );
*/


  }
}

Editor.propTypes = {
    //url: React.PropTypes.string,  //Not yet used, at some point backend will be added
};

Editor.defaultProps = {
    //url: "http://localhost:3000/pandaweb/all",
};

export default Editor;
