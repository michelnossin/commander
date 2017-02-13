import React from 'react';
import Rodal from 'rodal';
import ReactList from 'react-list';

class ContextDialog extends React.Component {

    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this)

        this.state = { visible: props.visible , selectedObject: props.selectedObject,
                      messages: []};

        //receive event from server
        this.props.socket.on('serverevent', ev_msg => {
          if (ev_msg.type == 'kafkamessage') {
            console.log("topic message via kafkia was received")
            console.log(ev_msg.message.value)
            var stateCopy = Object.assign({}, this.state);
            var messages = stateCopy.messages.push(ev_msg.message.value)
            this.setState(stateCopy);
            this.list.scrollTo(this.state.messages.length);


          }
        })

    }


    show() {
        this.setState({ visible: true });
    }

    hide() {
        //this.list = []
        this.setState({ visible: false });
        this.props.onClick()
    }

    onHandleChange(e) {
      var stateCopy = Object.assign({}, this.state);

      stateCopy.selectedObject.name = e.target.value
      this.setState(stateCopy);

      this.props.onChange(this.state.selectedObject)
    }

      renderItem(index, key) {
        //console.log("index : " + index)
        let self=this

        return <div key={key}>{self.state.messages[index]}</div>;
      }


      render() {

        let self=this

        let myBtn = (<button id="closebtn" onClick={this.props.onClick} >Close Dialog</button>)
        let objName = (<input id="objname" type="text" value={this.state.selectedObject.name}
                              onChange={this.onHandleChange.bind(this)} />)
        let eventList = (<ReactList itemRenderer={self.renderItem} length={self.state.messages.length} type='simple' ref={c => self.list = c} />)

        return (
            <div>
                <Rodal
                  customStyles={{position: "absolute", top: (this.state.selectedObject.y) + 'px', left: (this.state.selectedObject.x) + 'px'}}
                  visible={this.state.visible} onClose={this.hide.bind(this)}>
                  <div >
                      Name: {objName} {myBtn}
                      <div style={{height: 200, overflow: 'scroll'}}>
                        {eventList}
                      </div>

                  </div>
                </Rodal>
            </div>
        )
      }

}

export default ContextDialog;
