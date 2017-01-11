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

    this.myfunction = this.myfunction.bind(this)
  }

  myfunction() {
        console.log("CLICKED");
  }

//style={{backgroundColor: bgColors.Blue}}
  render() {
    return (
      <div className="Toolbar" >
        <Toolbar >
            <Region>
            <button><img src="/images/play.png" alt="Play, run this flow ongoing" onClick={this.myfunction} width="32" height="23" /></button>
            <button><img src="/images/db.png" alt="Database, data source" onClick={this.myfunction} width="32" height="23" /></button>
            <button><img src="/images/sink.png" alt="Sink, data target" onClick={this.myfunction} width="32" height="23" /></button>
            <button><img src="/images/connect.png" alt="Connect, conncecting sources and sinks" onClick={this.myfunction} width="32" height="23" /></button>
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
