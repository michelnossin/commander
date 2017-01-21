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

//The editor is the yellow editor field in which the user will add objects and connections.
class Editor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        mode : "", //Which toolbar button is pressed determines the mode (like play , source etc)
        objects : [],  //list of all objects drawn in the editor
        connections : [], //list of all connections (lines) between the objects
        drawingline: 0  //set to 1 while use is drawing a line, used by mousemove event
    };

    //this.sendMessage = this.sendMessage.bind(this)
    this.addObject = this.addObject.bind(this) //Add object like source or sink in editor
    this.addConnection = this.addConnection.bind(this)  //Add connection/line between two objects
    this.selectObject = this.selectObject.bind(this)    //select existing object or connection
    this.handleMouseUp = this.handleMouseUp.bind(this)  //mouse up event handler, used to add objects
    this.handleMouseDown = this.handleMouseDown.bind(this)  //mouse down event used to add connection (so moving mouse will make it larger)
    this.handleMouseMove = this.handleMouseMove.bind(this)  //Used to draw connections
    this.isLastConnectionValid = this.isLastConnectionValid.bind(this) //Is connection between two objects and thus valid
    this.correctLastConnection = this.correctLastConnection.bind(this) //If its valid make sure its connected at predetermined postions
    this.correctConnection = this.correctConnection.bind(this) //correct any connection, so it fits nicely between two objects
    this.removeLastConnection = this.removeLastConnection.bind(this) //If connection is not valid remove it

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

  //Mouse is moved
  handleMouseMove  (e) {
    if (this.state.drawingline == 1) {
      //Use is drawing line, make line larger
      var stateCopy = Object.assign({}, this.state);
      var lastLine = stateCopy.connections[stateCopy.connections.length-1]
      lastLine.x2 = e.clientX;
      lastLine.y2 = e.clientY;
      this.setState(stateCopy);

    }
  }
  //Mouse is clicked
  handleMouseDown  (e) {
    //Users wants to draw a connect Line,
    if (this.state.mode == "toolbar-connect-img" && e.target.id == "") {
      this.addConnection(e.clientX,e.clientY)
    }
  }
  //Mouse is clicked
  handleMouseUp  (e) {
    //Stop drawing line if we'r drawing
    if (this.state.drawingline == 1) {
      this.setState ({drawingline: 0})
      if (this.isLastConnectionValid() == 1)
        this.correctLastConnection()
      else
        this.removeLastConnection()

      return
    }
    //Toolbar click ignore
    else if (e.target.id == "toolbar")
      return
    //Toolbar button changes mode
    else if (e.target.id != "") {
       //"toolbar-play-img"
        this.setState({mode: e.target.id})
        return
      }
    //Click in editor add object, except if mode is play which just means the editor is playing, or empty
    else {
      if (this.state.mode != "toolbar-play-img" && this.state.mode != "" )
        this.addObject(e.clientX,e.clientY)
    }
  }

  componentWillMount  () {
        let self = this
        document.addEventListener('mouseup', self.handleMouseUp, false); //click
        document.addEventListener('mousedown', self.handleMouseDown, false);
        document.addEventListener('mousemove', self.handleMouseMove, false);
    }

  //Is last connection between two objects valid? 0 = No , 1 = Yes
  isLastConnectionValid() {
    var stateCopy = Object.assign({}, this.state);
    var lastLine = stateCopy.connections[stateCopy.connections.length-1]
    var startPointCorrect = 0
    var endPointCorrect = 0

    //Is startpoint last line on an existing object?
    this.state.objects.map((obj,index) => {
      //Is start point of line in an object?
      if (lastLine.x1 > obj.x - 25 && lastLine.x1 < obj.x + 25 &&
          lastLine.y1 > obj.y - 25 && lastLine.y1 < obj.y + 25 ) {
          startPointCorrect = 1
          lastLine["from"] = obj
        }
    })
    //Is endpoint lastline on an existing object?
    this.state.objects.map((obj,index) => {
      //Is start point of line in an object?
      if (lastLine.x2 > obj.x - 25 && lastLine.x2 < obj.x + 25 &&
          lastLine.y2 > obj.y - 25 && lastLine.y2 < obj.y + 25 ) {
          endPointCorrect = 1
          lastLine["to"] = obj
        }
    })

    //In case both are this last line is correct
    if (startPointCorrect == 1 && endPointCorrect == 1) {
      lastLine["corner"] = "right"
      this.setState({connections : stateCopy.connections})
      return 1
    }
    return 0
  }

  //correct a given connection so its fits nicely between two objects. ano object can connec in 2 ways, so switch mode also
  correctConnection(c) {
    var stateCopy = Object.assign({}, this.state);
    //var lastLine = stateCopy.connections[stateCopy.connections.length-1]
    if (c.x2 > c.x1 && c.y2 > c.y1) {
      if (c.corner == "left"){
        c.x1 = c.from.x
        c.y1 = c.from.y + 25
        c.x2 = c.to.x - 25
        c.y2 = c.to.y
      }
      else {
        c.x1 = c.from.x + 25
        c.y1 = c.from.y
        c.x2 = c.to.x
        c.y2 = c.to.y - 25
      }
    }
    this.setState({connections : stateCopy.connections})
  }
  //If last connection is correct we need to correct it so its connecting at correct positions
  correctLastConnection() {
    this.correctConnection(this.state.connections[this.state.connections.length-1])
  }

  //If last connection is not correct we will remove it
  removeLastConnection() {
    var stateCopy = Object.assign({}, this.state);
    stateCopy.connections.pop()
    this.setState({connections : stateCopy.connections})
  }

  //Add object in Editor
  addObject (x,y) {
    this.state.objects.push({ name: "Change this" , x: x, y:y , objType : this.state.mode})
    this.forceUpdate()
  }
  //Add connection between two objects
  addConnection (x,y) {
    this.state.connections.push({ x1: x, y1:y, x2:x ,y2:y , styling: "1px solid black"})
    this.setState({ drawingline: 1})
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
    document.removeEventListener('mouseup', this.handleMouseUp, false); //click
    document.removeEventListener('mousedown', this.handleMouseUp, false);
    document.removeEventListener('mousemove', this.handleMouseMove, false);

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
      <div className="Editor" id="editor" >
      {
        this.state.connections.map((obj,index) => (
         <div key={"connection_" + index}>
         <Line key={"connection_1_" + index}
         from={{x: obj.x1, y: obj.y1}}
         to={{x: obj.x2, y: obj.y1}} style={obj.styling}/>
         <Line key={"connection_2_" + index}
         from={{x: obj.x2, y: obj.y1}}
         to={{x: obj.x2, y: obj.y2}} style={obj.styling}/>
         </div>
       ))
      }
      {
        this.state.objects.map((obj,index) => (
          <div key={"obj_" + index}>
          <img ondragstart="return false;" className="Editor" key={"obj_" + index} style={{position: "absolute", top: (obj.y-25) + 'px', left: (obj.x-25) + 'px',
                           width: '50px' , height : '50px'}}
                           src={imageSrc(obj.objType)} />
          <h4 style={{position: "absolute", top: (obj.y + 25) + 'px', left: (obj.x - (textWidthPixels(obj.name) / 2)) + 'px'}}>{obj.name}</h4>
          </div>
        ))
      }
      </div>
    );
  }
}

Editor.propTypes = {
    //url: React.PropTypes.string,  //Not yet used, at some point backend will be added
};

Editor.defaultProps = {
    //url: "http://localhost:3000/pandaweb/all",
};

export default Editor;
