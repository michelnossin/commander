import React from 'react';
var Toolbar = require('react-simple-toolbar')
var Region  = Toolbar.Region
var bgColors = { "Default": "#81b71a",
                    "Blue": "#00B1E1",
                    "Cyan": "#37BC9B",
                    "Green": "#8CC152",
                    "Red": "#E9573F",
                    "Yellow": "#F6BB42",
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

  }

  //Click Toolbar button event lsnr
  clickBtn(e) {

        let mode = e.target.id
        console.log("CLICKED " + mode);
        this.setState( { mode: mode})
  }

  playBtn(){
    if (this.state.mode == "toolbar-play-img")
      return  <button style={{border: "5px"}} id="toolbar-play-btn"><img id="toolbar-play-img" src="/images/play.png" alt="Play, run this flow ongoing" onClick={this.clickBtn} width="32" height="23" /></button>
    else
      return  <button id="toolbar-play-btn"><img id="toolbar-play-img" src="/images/play.png" alt="Play, run this flow ongoing" onClick={this.clickBtn} width="32" height="23" /></button>
  }
  dbBtn(){
    if (this.state.mode == "toolbar-db-img")
      return  <button style={{border: "5px"}} id="toolbar-db-btn"><img id="toolbar-db-img" src="/images/db.png" alt="Database, data source" onClick={this.clickBtn} width="32" height="23" /></button>
    else
      return  <button id="toolbar-db-btn"><img id="toolbar-db-img" src="/images/db.png" alt="Database, data source" onClick={this.clickBtn} width="32" height="23" /></button>
  }
  sinkBtn(){
    if (this.state.mode == "toolbar-sink-img")
      return <button style={{border: "5px"}} id="toolbar-sink-btn"><img id="toolbar-sink-img" src="/images/sink.png" alt="Sink, data target" onClick={this.clickBtn} width="32" height="23" /></button>
    else
      return  <button id="toolbar-sink-btn"><img id="toolbar-sink-img" src="/images/sink.png" alt="Sink, data target" onClick={this.clickBtn} width="32" height="23" /></button>
  }
  connectBtn(){
    if (this.state.mode == "toolbar-connect-img")
      return <button style={{border: "5px"}} id="toolbar-connect-btn"><img id="toolbar-connect-img" src="/images/connect.png" alt="Connect, conncecting sources and sinks" onClick={this.clickBtn} width="32" height="23" /></button>
    else
      return  <button id="toolbar-connect-btn"><img id="toolbar-connect-img" src="/images/connect.png" alt="Connect, conncecting sources and sinks" onClick={this.clickBtn} width="32" height="23" /></button>
    }

  render() {
    return (
      <div className="Toolbar" >
        <Toolbar >
            <Region id="toolbar">
              {this.playBtn()}{this.dbBtn()}{this.sinkBtn()}{this.connectBtn()}
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
