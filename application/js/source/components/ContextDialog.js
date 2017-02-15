import React from 'react';
import Rodal from 'rodal';
import ReactList from 'react-list';

/*
[
 {"0":
   {"nodeId":0,
   "host":"ec2-52-209-29-218.eu-west-1.compute.amazonaws.com",
   "port":9092
   }
 },
 {"metadata":
   {"ciss":
     {"0":
       {"topic": "ciss",
       "partition":0,
       "leader":0,
       "replicas":[0],
       "isr":[0]
       }
     }
   }
 }
]
*/


class ContextDialog extends React.Component {

    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this)

        this.state = { visible: props.visible , selectedObject: props.selectedObject,
                      messages: [], topics : [] };

        //receive event from server
        this.props.socket.on('serverevent', ev_msg => {
          if (ev_msg.type == 'kafkamessage') {
            console.log("topic message via kafkia was received: " + ev_msg.message.value)
            console.log(ev_msg.message.value)
            var stateCopy = Object.assign({}, this.state);
            var messages = stateCopy.messages.push(ev_msg.message.value)
            this.setState(stateCopy);
            if (this.list) this.list.scrollTo(this.state.messages.length);
          }
          else if (ev_msg.type == 'kafkatopics') {

            var stateCopy = Object.assign({}, this.state);
            let len = ev_msg.message.length;
            for (var i = 0; i < len; i++) {
              Object.keys(ev_msg.message[i]).map((keys,index) => {
              //for (var topic in Object.keys(ev_msg.message[i])) {
                //var topics = stateCopy.topics.push(keys)
                if (keys == "metadata") {
                  Object.keys(ev_msg.message[i].metadata).map((topics,index) => {
                    var topics = stateCopy.topics.push(topics)
                  })
                }
              //}
              })
            }
            this.setState(stateCopy);
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
        //let topicList = ({self.state.topics}</h4>)
        return (
            <div>
                <Rodal
                  customStyles={{position: "absolute", top: (this.state.selectedObject.y) + 'px', left: (this.state.selectedObject.x) + 'px'}}
                  visible={this.state.visible} onClose={this.hide.bind(this)}>
                  <div >
                      <p>Name: {objName} {myBtn}</p>
                      <p>Topic: {this.state.topics}</p>
                      <div style={{height: 200, overflow: 'scroll'}}>
                      Monitor events:
                        {eventList}
                      </div>

                  </div>
                </Rodal>
            </div>
        )
      }

}

export default ContextDialog;
