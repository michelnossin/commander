import React from 'react';
import ReactDOM from 'react-dom';
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
        mode : "",
        objects : []  //list of all non current lines
    };

    //this.sendMessage = this.sendMessage.bind(this)
    this.addObject = this.addObject.bind(this)
    this.selectObject = this.selectObject.bind(this)
    this.handleClick = this.handleClick.bind(this)

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

  //Mouse is clicked
  handleClick  (e) {

    //Toolbar click ignore
    if (e.target.id == "toolbar")
      return
    //Toolbar button changes mode
    else if (e.target.id != "") {
       //"toolbar-play-img"
        this.setState({mode: e.target.id})
        return
      }
    //Click in editor add object
    else {
      if (this.state.mode != "toolbar-play-img")
        this.addObject(e.clientX,e.clientY)
    }
  }

  componentWillMount  () {
        let self = this
        document.addEventListener('click', self.handleClick, false);
    }

  //Add object in Editor
  addObject (x,y) {
    this.state.objects.push({ name: "Change this" , x: x, y:y , objType : this.state.mode})
    this.forceUpdate()
  }

  selectObject () {
    return
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
    window.removeEventListener("resize", this.updateDimensions);
    document.removeEventListener('click', this.handleClick, false);

  }

  //Send event message to server, for example to let others know we change our line direction
  sendMessage(message) {
    socket.emit('clientmessage', message)
  }

  render() {
    var username=""

     //util function Return image path based on obj type
     var imageSrc = function (objType) {
       let result;
       switch (objType) {
         case "toolbar-play-img":
            result = "images/play.png"
            break;
         case "toolbar-db-img":
            result = "images/db.png"
            break;
          case "toolbar-sink-img":
             result = "images/sink.png"
             break;
          case "toolbar-connect-img":
             result = "images/connect.png"
             break;
        }
        return result

     }

     //get pixel for text so we can add title on objects nicely centered
     var textWidthPixels = function(txt){
         // Create dummy span
         let x = document.createElement('span');
         // Set text
         x.innerHTML = txt;
         document.body.appendChild(x);
         // Get width NOW, since the dummy span is about to be removed from the document
         var w = x.offsetWidth;
         // Cleanup
         document.body.removeChild(x);
         // All right, we're done
         return w;
 }


    return (
      <div className="Editor" id="editor" >{
        this.state.objects.map((obj,index) => (
          <div>
          <img key={index} style={{position: "absolute", top: (obj.y-25) + 'px', left: (obj.x-25) + 'px',
                           width: '50px' , height : '50px'}}
                           src={imageSrc(obj.objType)} />
          <h4 style={{position: "absolute", top: (obj.y + 25) + 'px', left: (obj.x - (textWidthPixels(obj.name) / 2)) + 'px'}}>{obj.name}</h4>
          </div>
        ))

      }</div>
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
