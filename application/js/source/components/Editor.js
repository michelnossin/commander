import React from 'react';
import keydown from 'react-keydown';
import ReactDOM from 'react-dom';
import Line from './Line';
import io from 'socket.io-client'
import ContextDialog from './ContextDialog'

//import Rodal from 'rodal';
//import Modal from 'boron/DropModal';
//import InlineEdit from 'react-edit-inline';
//import 'rodal/lib/rodal.css';

let socket = io(`http://localhost`) //our server 192.168.0.105
var bgColors = { "Default": "#81b71a",
                    "Blue": "#00B1E1",
                    "Cyan": "#37BC9B",
                    "Green": "#8CC152",
                    "Red": "#E9573F",
                    "Yellow": "#F6BB42",
                    "White": "#FFFFFF",
                    "Black": "#000000",

};

//let user = "user_" + Math.random().toString(36).substring(7); //Lets give the user a name, todo: let the user make this up
//console.log("Client is using this name: " + user  );

//The editor is the yellow editor field in which the user will add objects and connections.
//@keydown
class Editor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        mode : "", //Which toolbar button is pressed determines the mode (like play , source etc)
        objects : [],  //list of all objects drawn in the editor
        connections : [], //list of all connections (lines) between the objects
        drawingline: 0,  //set to 1 while use is drawing a line, used by mousemove event
        selectedObject: 0,  //Set object reference last selected (also connections), or 0 if non
        contextMenu: false, //set to true if user clicked right mouse button on a object
        movingObject: 0   //set to 1 if we are moving an object (non connection)
    };

    //this.sendMessage = this.sendMessage.bind(this)
    this.addObject = this.addObject.bind(this) //Add object like source or sink in editor
    this.addConnection = this.addConnection.bind(this)  //Add connection/line between two objects
    this.handleMouseUp = this.handleMouseUp.bind(this)  //mouse up event handler, used to add objects
    this.handleLeftMouseDown = this.handleLeftMouseDown.bind(this)  //mouse down event used to add connection (so moving mouse will make it larger)
    this.handleRightMouseDown = this.handleRightMouseDown.bind(this)  //mouse down event used to add connection (so moving mouse will make it larger)
    this.handleMouseMove = this.handleMouseMove.bind(this)  //Used to draw connections
    this.handleKeyDown = this.handleKeyDown.bind(this)  //keydown, eg to delete objects
    this.isLastConnectionValid = this.isLastConnectionValid.bind(this) //Is connection between two objects and thus valid
    this.correctLastConnection = this.correctLastConnection.bind(this) //If its valid make sure its connected at predetermined postions
    this.correctConnection = this.correctConnection.bind(this) //correct any connection, so it fits nicely between two objects
    this.removeLastConnection = this.removeLastConnection.bind(this) //If connection is not valid remove it
    this.selectObject = this.selectObject.bind(this) //Select object at given position, if any
    this.deselectAll = this.deselectAll.bind(this) //deselect all objects and connections
    this.deleteSelectedObject = this.deleteSelectedObject.bind(this) //delete selected object/connections or connection (after delete key press)
    this.closeMenuWin = this.closeMenuWin.bind(this) //close context dialog (properties for objects)
    this.clickBtn = this.clickBtn.bind(this) //global click handler for editor (not used)
    this.onChangeSelectedObject = this.onChangeSelectedObject.bind(this)  //Change within context dialog call this function (eg change obj name on the spot)
    //this.onServerEvent = this.onServerEvent.bind(this) //Event from server, most likeyly socket event for a kafka message

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
    if (this.state.movingObject != 0) {
      //var stateCopy = Object.assign({}, this.state);
      //var lastSelectedObject = stateCopy.selectedObject
      var lastSelectedObject = this.state.selectedObject
      lastSelectedObject.x = e.clientX;
      lastSelectedObject.y = e.clientY;
      //Check all connections if the are related to the slected object and make them fit nicely while moving
      lastSelectedObject.connectedConnections.map((obj,index) => {
        this.correctConnection(obj)
      })

      //this.setState(stateCopy);
      this.setState({ selectedObject : lastSelectedObject});
    }
    else if (this.state.drawingline == 1) {
      //Use is drawing line, make line larger
      var stateCopy = Object.assign({}, this.state);
      var lastLine = stateCopy.connections[stateCopy.connections.length-1]
      lastLine.x2 = e.clientX;
      lastLine.y2 = e.clientY;
      this.setState(stateCopy);

    }
  }

  //Select object at certain position (if an object exists at the position)
  selectObject(posX,posY) {

    var isObjectFound = 0
    //Is position at a object? Select it, and deselect the rest
    this.state.objects.map((obj,index) => {
      if (posX > obj.x - 25 && posX < obj.x + 25 ) {
        if (posY > obj.y - 25 && posY < obj.y + 25) {
          //Yes found object, deselect al objects and select current object
          this.deselectAll()
          obj["selected"] = 1
          this.setState({ selectedObject : obj})
          isObjectFound = 1 //object selected
        }
      }

     })

     //Is position at a connection? Select it, delesecting the rest
     this.state.connections.map((obj,index) => {

       if (obj["corner"] == "left") {
         let condition1 = ((posX > obj.x1 && posX < obj.x2 && posY < obj.y2 + 5 && posY > obj.y2 - 5) ||
                      (posX > obj.x1 -5 && posX < obj.x1 + 5 && posY > obj.y1 && posY < obj.y2))
         let condition2 = ((posX > obj.x1 && posX < obj.x2 && posY < obj.y2 + 5 && posY > obj.y2 - 5) ||
                     (posX > obj.x1 -5 && posX < obj.x1 + 5 && posY > obj.y2 && posY < obj.y1))
         let condition3 = ((posX > obj.x2 && posX < obj.x1 && posY < obj.y2 + 5 && posY > obj.y2 - 5) ||
                      (posX > obj.x1 -5 && posX < obj.x1 + 5 && posY > obj.y2 && posY < obj.y1))
         let condition4 = ((posX > obj.x2 && posX < obj.x1 && posY < obj.y2 + 5 && posY > obj.y2 - 5) ||
                     (posX > obj.x1 -5 && posX < obj.x1 + 5 && posY > obj.y1 && posY < obj.y2))


            if ((obj.x1 < obj.x2 && obj.y1 < obj.y2 && condition1) ||
             (obj.x1 < obj.x2 && obj.y1 > obj.y2 && condition2) ||
              (obj.x2 < obj.x1 && obj.y2 < obj.y1 && condition3) ||
            (obj.x1 > obj.x2 && obj.y2 > obj.y1 && condition4)) {
             //Yes found object, deselect al objects and select current object
             this.deselectAll()
             obj["selected"] = 1
             this.setState({ selectedObject : obj})

             obj["corner"] = "right"  //switch corner connection if clicked
             isObjectFound = 1
             this.correctConnection(obj) //Beautify it again
           }

       }
       //Right
       else {
         let condition1 = ((posX > obj.x1 && posX < obj.x2 && posY < obj.y1 + 5 && posY > obj.y1 - 5) ||
                      (posX > obj.x2 -5 && posX < obj.x2 + 5 && posY > obj.y1 && posY < obj.y2))
         let condition2 = ((posX > obj.x1 && posX < obj.x2 && posY < obj.y1 + 5 && posY > obj.y1 - 5) ||
                     (posX > obj.x2 -5 && posX < obj.x2 + 5 && posY > obj.y2 && posY < obj.y1))
         let condition3 = ((posX > obj.x2 && posX < obj.x1 && posY < obj.y1 + 5 && posY > obj.y1 - 5) ||
                      (posX > obj.x2 -5 && posX < obj.x2 + 5 && posY > obj.y2 && posY < obj.y1))
         let condition4 = ((posX > obj.x2 && posX < obj.x1 && posY < obj.y1 + 5 && posY > obj.y1 - 5) ||
                     (posX > obj.x2 -5 && posX < obj.x2 + 5 && posY > obj.y1 && posY < obj.y2))


            if ((obj.x1 < obj.x2 && obj.y1 < obj.y2 && condition1) ||
             (obj.x1 < obj.x2 && obj.y1 > obj.y2 && condition2) ||
              (obj.x2 < obj.x1 && obj.y2 < obj.y1 && condition3) ||
            (obj.x1 > obj.x2 && obj.y2 > obj.y1 && condition4)) {
             //Yes found object, deselect al objects and select current object
             this.deselectAll()
             obj["selected"] = 1
             this.setState({ selectedObject : obj})
             obj["corner"] = "left"  //switch corner connection if clicked
             isObjectFound = 1
             this.correctConnection(obj) //Beautify it again
           }
       }
      })

    if (isObjectFound == 1) this.forceUpdate()
     return isObjectFound

  }

  //Mouse is clicked down using right button (so show context menu)
  handleRightMouseDown  (e) {
    if (this.state.contextMenu == true) return

    console.log("Client used right mouse "  );
    if (this.selectObject(e.clientX,e.clientY) != 0) {//Select object in case we clicked on it (or on a connection)

      e.preventDefault();
      //this.setState({ selectedObject : 1})
      /*
      window.removeEventListener('mouseup', this.handleMouseUp, false); //click
      window.removeEventListener('mousedown', this.handleLeftMouseDown, false);
      window.removeEventListener('contextmenu', this.handleRightMouseDown, false);
      window.removeEventListener('mousemove', this.handleMouseMove, false);
      window.removeEventListener('keydown', this.handleKeyDown, false);
*/
      //window.removeEventListener('keydown', this.handleKeyDown, false); //Temporaray disable keypress so delete button in dialog can be used
      this.setState({ contextMenu : true}) //This will make Render show some nice dialog

      return true //Prevent context menu browser popup

    }
  }

  //Mouse is clicked down using left key
  handleLeftMouseDown  (e) {
    console.log("Client used left mouse "  );
    if (this.state.contextMenu == true) {
      console.log("in context mode "  );

      return
    }

    //Users wants to draw a connect Line,
    if (this.state.mode == "connect" && e.target.id == "") {
      this.addConnection(e.clientX,e.clientY)
      e.preventDefault();
      return true //prevent dragging of image
    }
    //Click in editor means: add object, except when in play mode or on top of other object
    else {
      if (this.state.mode != "play" && this.state.mode != "" && this.state.mode != "connect") {
        if (this.selectObject(e.clientX,e.clientY) != 0) {
          //Select object in case we clicked on it (or on a connection)
          this.setState({ movingObject : 1})
          e.preventDefault();
          return true //prevent dragging of image
        }
        else
          this.setState({ selectedObject : 0})

        }
    }
  }

  //Mouse is clicked up
  handleMouseUp  (e) {
    //console.log("Client used mouse up "  );

    if (this.state.contextMenu == true) {
      return
    }

    if (this.state.movingObject != 0) {
      this.setState({ movingObject : 0})
    }
    //Stop drawing line if we'r drawing and make the connection line nice after validity check (it has to connect 2 objects)
    if (this.state.drawingline == 1) {
      this.setState ({drawingline: 0})
      if (this.isLastConnectionValid() == 1)
        this.correctLastConnection() //Make it fit nicely to the objects
      else
        this.removeLastConnection()

    }
    //Toolbar click ignore
    if (e.target.id == "toolbar")
      return
    //Toolbar button changes mode
    else if (e.target.id != "") {
       //"toolbar-play-img"
        if (e.target.id == "toolbar-play-img" || e.target.id == "toolbar-play-btn") this.setState({mode: "play"})
        else if (e.target.id == "toolbar-db-img" || e.target.id == "toolbar-db-btn") this.setState({mode: "db"})
        else if (e.target.id == "toolbar-sink-img" || e.target.id == "toolbar-sink-btn") this.setState({mode: "sink"})
        else if (e.target.id == "toolbar-connect-img" || e.target.id == "toolbar-connect-btn") this.setState({mode: "connect"})
        return
      }
    //Click in editor means: add object, except when in play mode or on top of other object
    else {
      if (this.state.mode != "play" && this.state.mode != "" && this.state.mode != "connect") {
        //if (this.selectObject(e.clientX,e.clientY) == 0) //Select object in case we clicked on it (or on a connection)
        if (this.state.selectedObject == 0)
          this.addObject(e.clientX,e.clientY)
      }
    }
  }

  //keypress reveived
    handleKeyDown(event) {

      if ( event ) {
        //Delete key
        if (event.which == 46) {
            this.deleteSelectedObject()
        }
    }
  }

  componentWillMount  () {
      let self = this
      console.log("mounting event handlers")

      window.addEventListener('mouseup', self.handleMouseUp, false); //click
      window.addEventListener('mousedown', self.handleLeftMouseDown, false);
      window.addEventListener('mousemove', self.handleMouseMove, false);
      window.addEventListener('keydown', self.handleKeyDown, false);
      window.addEventListener('contextmenu', self.handleRightMouseDown, false);
      //window.addEventListener('click', self.clickBtn, false);

    }

  deleteSelectedObject() {
    var stateCopy = Object.assign({}, this.state);

    let so = stateCopy.selectedObject

    //There is a selected objects let kill it
    if (so != 0) {

        //Does it have connected connections remove these also
        if (so.connectedConnections) {
          so.connectedConnections.map((obj,index) => {
            var index = stateCopy.connections.indexOf(obj);
            if (index > -1) {
              stateCopy.connections.splice(index, 1);
            }
          })
        }

        //Remove the object itself (or connection if its not an object)
        var index = stateCopy.objects.indexOf(so);
        if (index > -1) {
          stateCopy.objects.splice(index, 1);
        }
        index = stateCopy.connections.indexOf(so);
        if (index > -1) {
          stateCopy.connections.splice(index, 1);
        }

        this.setState(stateCopy)

    }

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
      lastLine["to"].connectedConnections.push(lastLine)
      lastLine["from"].connectedConnections.push(lastLine)
      this.setState({connections : stateCopy.connections})
      return 1
    }
    return 0
  }

  //correct a given connection so its fits nicely between two objects. ano object can connec in 2 ways, so switch mode also
  correctConnection(c) {

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
    else if (c.x2 > c.x1 && c.y2 < c.y1) {
      if (c.corner == "left"){
        c.x1 = c.from.x
        c.y1 = c.from.y - 25
        c.x2 = c.to.x - 25
        c.y2 = c.to.y
      }
      else {
        c.x1 = c.from.x + 25
        c.y1 = c.from.y
        c.x2 = c.to.x
        c.y2 = c.to.y + 25
      }
    }
    else if (c.x2 < c.x1 && c.y2 < c.y1) {
      if (c.corner == "right"){
        c.x1 = c.from.x - 25
        c.y1 = c.from.y
        c.x2 = c.to.x
        c.y2 = c.to.y + 25
      }
      else {
        c.x1 = c.from.x
        c.y1 = c.from.y - 25
        c.x2 = c.to.x + 25
        c.y2 = c.to.y
      }
    }
    else if (c.x2 < c.x1 && c.y2 > c.y1) {
      if (c.corner == "right"){
        c.x1 = c.from.x - 25
        c.y1 = c.from.y
        c.x2 = c.to.x
        c.y2 = c.to.y - 25
      }
      else {
        c.x1 = c.from.x
        c.y1 = c.from.y + 25
        c.x2 = c.to.x + 25
        c.y2 = c.to.y
      }
    }
    //if we get in the else clause it might mean the connection line does not connect the from and to objects anymore, due to moving an object
    //Check if connection has from and to object set and reset it to the middle, calling the correction again
    else {
      if (c.from != 0 && c.to != 0) {
        c.x1 = c.from.x
        c.y1 = c.from.y
        c.x2 = c.to.x
        c.y2 = c.to.y
        this.correctConnection(c)
      }
    }
    if (this.state.movingObject == 0 ) //While moving do not refresh the screen.
      this.forceUpdate()
    //this.setState({connections : stateCopy.connections})
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

  //Deselect all objects and connections
  deselectAll() {
    this.state.objects.map((obj,index) => { obj["selected"] = 0})
    this.state.connections.map((obj,index) => { obj["selected"] = 0})
  }
  //Add object in Editor
  addObject (x,y) {
    this.deselectAll()
    this.state.objects.push({ name: "Change this" , topic: "" , x: x, y:y , objType : this.state.mode, selected : 0, connectedConnections : []})
    this.forceUpdate()
  }
  //Add connection between two objects
  addConnection (x,y) {
    this.deselectAll()
    this.state.connections.push({ x1: x, y1:y, x2:x ,y2:y , styling: "1px solid black",corner: "right", selected: 0, from: 0 , to: 0})
    this.setState({ drawingline: 1})
    this.forceUpdate()
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
    window.removeEventListener("resize", this.updateDimensions);
    window.removeEventListener('mouseup', this.handleMouseUp, false); //click
    window.removeEventListener('mousedown', this.handleLeftMouseDown, false);
    window.removeEventListener('contextmenu', this.handleRightMouseDown, false);
    window.removeEventListener('mousemove', this.handleMouseMove, false);
    window.removeEventListener('keydown', this.handleKeyDown, false);

  }

  //Send event message to server, for example to let others know we change our line direction
  sendMessage(message) {
    socket.emit('clientmessage', message)
  }

  //Close context menu
  closeMenuWin(e) {
      console.log("closing context")
      //window.addEventListener('keydown', self.handleKeyDown, false); //Enable keypress (delete button) in normal operational mode
      this.setState({ contextMenu: false });
    }

  //click with editor received.
  clickBtn(e) {
    console.log("editor click event")
  }

  //Change event (obj name changed within context dialog)
  onChangeSelectedObject(selectedObject) {
    console.log("Changed object")
    var stateCopy = Object.assign({}, this.state);
    stateCopy.selectedObject = selectedObject
    this.setState(stateCopy);
  }


  //Render actually shows the editor frontend. First we will define some utility functions
  render() {
    var username=""

     //util function Return image path based on obj type
     var imageSrc = function (objType) {
       let result;
       switch (objType) {
         case "play":
            result = "images/play.png"
            break;
         case "db":
            result = "images/db.png"
            break;
          case "sink":
             result = "images/sink.png"
             break;
          case "connect":
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

    //Get triangle based on position begin and and so it directs correct
    var getTriangle = function(x1,y1,x2,y2,corner) {
      if (corner == "right" ) {
        if (x2 > x1)
          return "images/triangle-right.png"
        else
          return "images/triangle-left.png"
      }
      else {
        if (y2 > y1)
          return "images/triangle-down.png"
        else
          return "images/triangle-up.png"
      }
    }

    //Get object style, which is the same except when selected
    var getObjectStyle = function(obj) {
      var result = {position: "absolute", top: (obj.y-25) + 'px', left: (obj.x-25) + 'px', width: '50px' , height : '50px'}
      if (obj.selected == 1)
        result["outline"] = '6px dotted orange'

      return result
    }

    //Get style for the connection objects
    var getConnectionStyle = function(obj) {
      var result
      if (obj.selected == 1)
        result = "1px dotted orange"
      else
        result = "1px solid black"

      return result
    }

    //Based on the connection object render the connection lines and triangle
    //So each connection has 2 lines always, and a image (triangle) we used to show an arrow
    //The lines and triangle are determined based on the 2 possible connection modes , based on left or right corner.
    var getConnection = function(obj,index) {
      if (obj["corner"] == "right") {
         return (
            <div key={"connection_" + index}>
            <Line key={"connection_1_" + index}
                from={{x: obj.x1, y: obj.y1}}
                to={{x: obj.x2, y: obj.y1}} style={getConnectionStyle(obj)}/>
            <Line key={"connection_2_" + index}
                from={{x: obj.x2, y: obj.y1}}
                to={{x: obj.x2, y: obj.y2}} style={getConnectionStyle(obj)}/>
            <img key={"connection_3_" + index}
                style={{position: "absolute", top: (obj.y1 - 8) + 'px', left: (obj.x2 - ((obj.x2 - obj.x1)/2)) + 'px'}}
               src={getTriangle(obj.x1,obj.y1,obj.x2,obj.y2,obj.corner)} />
          </div>
        )}
        else {
          return (
             <div key={"connection_" + index}>
             <Line key={"connection_1_" + index}
                 from={{x: obj.x1, y: obj.y1}}
                 to={{x: obj.x1, y: obj.y2}} style={getConnectionStyle(obj)}/>
             <Line key={"connection_2_" + index}
                 from={{x: obj.x1, y: obj.y2}}
                 to={{x: obj.x2, y: obj.y2}} style={getConnectionStyle(obj)}/>
             <img key={"connection_3_" + index}
                 style={{position: "absolute", top: (obj.y2 - ((obj.y2 - obj.y1)/2)) + 'px', left: (obj.x1 - 8) + 'px'}}
                src={getTriangle(obj.x1,obj.y1,obj.x2,obj.y2,obj.corner)} />
           </div>
         )
        }
    }

    //Get dialog if user press right button
    var getContextMenu = function(self) {

      var contextMenu
      if (self.state.contextMenu == true) {
        //We for this moment will alway assume we open the context menu for a Kafka object
        //socket.emit('clientmessage', {type : "connectKafkaConsumer", zooKeeper : "52.209.29.218:2181/" , topic : "ciss" })

        contextMenu = <div id="someid" >
                           <ContextDialog key="contextmenu"
                                      onClick={self.closeMenuWin}
                                      onChange={self.onChangeSelectedObject}
                                      socket={socket}
                                      selectedObject={self.state.selectedObject}
                                      visible={true} />
                      </div>
      }
      return contextMenu
    }

    let self=this

    //First draw all connections (lines), then all objects (images), and finally the object text directly under the images so their appear first
    //The ContextMenu function will be called, which will show a popup dialog in case the state of the editor is in context mode after
    //Clicking the right mouse on top of an object
    return (
      <div onClick={this.clickBtn} className="Editor" id="editor" >
      {
        this.state.connections.map((obj,index) => getConnection(obj,index))
      }
      {
        this.state.objects.map((obj,index) => (
          <div key={"obj_" + index}>
          <img draggable={false} onDragStart={false} className="Editor" key={"obj_" + index}
                           style={getObjectStyle(obj)}
                           src={imageSrc(obj.objType)} />
          <h4 style={{position: "absolute", top: (obj.y + 25) + 'px', left: (obj.x - (textWidthPixels(obj.name) / 2)) + 'px'}}>
              <span style={{color: bgColors.Black, backgroundColor: bgColors.White}}>{obj.name}</span></h4>
          </div>
        ))
      }
      {
          getContextMenu(self)
      }
      </div>
    );
  }
}

Editor.propTypes = {
    url: React.PropTypes.string,  //Not yet used, at some point backend will be added
};

Editor.defaultProps = {
    url: "http://localhost:3000/pandaweb/all",
};

export default Editor;
