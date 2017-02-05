import React from 'react';
var Toolbar = require('react-simple-toolbar')
var Region  = Toolbar.Region
var bgColors = { "Default": "#81b71a",
                    "Blue": "#0000FF",
                    "Cyan": "#37BC9B",
                    "Green": "#8CC152",
                    "Red": "#E9573F",
                    "Yellow": "#F6BB42",
                    "White": "#FFFFFF",
};


class MyBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      mode : ""
    };

    this.clickBtn = this.clickBtn.bind(this)

    this.playBtn = this.playBtn.bind(this)
    this.dbBtn = this.dbBtn.bind(this)
    this.sinkBtn = this.sinkBtn.bind(this)
    this.connectBtn = this.connectBtn.bind(this)
    this.dataAdmiralLogo = this.dataAdmiralLogo.bind(this)

  }

  //Click Toolbar button event lsnr
  clickBtn(e) {

        var mode = ""
        if (e.target.id == "toolbar-play-img" || e.target.id == "toolbar-play-btn") mode = "play"
        else if (e.target.id == "toolbar-db-img" || e.target.id == "toolbar-db-btn") mode = "db"
        else if (e.target.id == "toolbar-sink-img" || e.target.id == "toolbar-sink-btn") mode = "sink"
        else if (e.target.id == "toolbar-connect-img" || e.target.id == "toolbar-connect-btn") mode = "connect"

        console.log("CLICKED " + mode);

        this.setState( { mode: mode})
  }

  playBtn(){
    if (this.state.mode == "play")
      return  <button style={{border: "5px"}} id="toolbar-play-btn"><img id="toolbar-play-img" src="/images/play.png" alt="Play, run this flow ongoing" width="32" height="23" /></button>
    else
      return  <button id="toolbar-play-btn"><img id="toolbar-play-img" src="/images/play.png" alt="Play, run this flow ongoing" width="32" height="23" /></button>
  }
  dbBtn(){
    if (this.state.mode == "db")
      return  <button style={{border: "5px"}} id="toolbar-db-btn"><img id="toolbar-db-img" src="/images/db.png" alt="Database, data source"  width="32" height="23" /></button>
    else
      return  <button id="toolbar-db-btn"><img id="toolbar-db-img" src="/images/db.png" alt="Database, data source" width="32" height="23" /></button>
  }
  sinkBtn(){
    if (this.state.mode == "sink")
      return <button style={{border: "5px"}} id="toolbar-sink-btn"><img id="toolbar-sink-img" src="/images/sink.png" alt="Sink, data target"  width="32" height="23" /></button>
    else
      return  <button id="toolbar-sink-btn"><img id="toolbar-sink-img" src="/images/sink.png" alt="Sink, data target"  width="32" height="23" /></button>
  }
  connectBtn(){
    if (this.state.mode == "connect")
      return <button style={{border: "5px"}} id="toolbar-connect-btn"><img id="toolbar-connect-img" src="/images/connect.png" alt="Connect, conncecting sources and sinks" width="32" height="23" /></button>
    else
      return  <button id="toolbar-connect-btn"><img id="toolbar-connect-img" src="/images/connect.png" alt="Connect, conncecting sources and sinks"  width="32" height="23" /></button>
    }

  dataAdmiralLogo() {
    return <span style={{color: bgColors.Blue, backgroundColor: bgColors.White}}>Data Admiral</span>
  }
  render() {
    
    return (
      <div onClick={this.clickBtn} className="Toolbar" >
        <Toolbar >
            <Region id="toolbar">
              {this.playBtn()}{this.dbBtn()}{this.sinkBtn()}{this.connectBtn()}
            </Region>
            <Region align="right">
              {this.dataAdmiralLogo()}
            </Region>
        </Toolbar>
      </div>
    );
  }

  componentWillMount(){
      document.body.style.margin = "0px";
  }
  componentWillUnmount(){
      document.body.style.margin = null;
  }
}

MyBar.propTypes = {
    //url: React.PropTypes.string,  //Not yet used, at some point backend will be added
};

MyBar.defaultProps = {
    //url: "http://localhost:3000/pandaweb/all",
};

export default MyBar;
