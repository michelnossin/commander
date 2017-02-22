import React from 'react';
import Rodal from 'rodal';
import ReactList from 'react-list';
import Select from 'react-select';

class ContextDialog extends React.Component {

    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this)
        this.changeTopic = this.changeTopic.bind(this)

        this.state = { visible: props.visible , selectedObject: props.selectedObject,
                      messages: [], topics : [] , selectedTopic : props.selectedObject.topic };

        //Create Kafka consumer
        this.props.socket.emit('clientmessage', {type : "connectKafkaConsumer", zooKeeper : "52.209.29.218:2181/"  }) //, topic : "ciss"
        if (props.selectedObject.topic != "") {
          this.props.socket.emit('clientmessage', {type : "startConsumeTopic", topic: props.selectedObject.topic.value ,zooKeeper : "52.209.29.218:2181/"})
        }

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
            console.log("topics list received from server")

            var stateCopy = Object.assign({}, this.state);
            stateCopy.topics = []  //Reset any values in the topics list , we will receive a new updated list now.
            let len = ev_msg.message.length;
            for (var i = 0; i < len; i++) {
              Object.keys(ev_msg.message[i]).map((keys,index) => {
                if (keys == "metadata") {
                  Object.keys(ev_msg.message[i].metadata).map((tp,index) => {
                    let topic = { value: tp, label: tp }
                    var topics = stateCopy.topics.push(topic)
                  })
                }
              })
            }
            this.setState(stateCopy);

          }
        })
    }

    //Called when changing combobox value filled with Kafka Topics
    changeTopic(topic) {
        console.log("Selected: " + topic);
        this.setState({selectedTopic : topic})
        this.state.selectedObject.topic = topic
        this.props.socket.emit('clientmessage', {type : "startConsumeTopic", topic: topic.value , zooKeeper : "52.209.29.218:2181/"})
    }

    //Mounting
    componentDidMount()  {
      //start reading messages if topic is set
      //if (props.selectedObject.topic != "") {
      //  this.props.socket.emit('clientmessage', {type : "startConsumeTopic", topic: props.selectedObject.topic.value })
      //}

    }

    //Dialog is closing
    componentWillUnmount() {
      this.props.socket.emit('clientmessage', {type : "disconnectKafkaConsumer" })
    }


    show() {
        this.setState({ visible: true });
    }

    hide() {
        //this.list = []
        this.setState({ visible: false });
        this.props.onClick()
    }

    //change title of an object
    onHandleChange(e) {
      var stateCopy = Object.assign({}, this.state);

      stateCopy.selectedObject.name = e.target.value
      this.setState(stateCopy);

      this.props.onChange(this.state.selectedObject)
    }

      //Show a single kafkamessage
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
        //let topicList = ({self.state.topics}</h4>)  //this.state.topics
        let topicList = (<Select name="form-field-name" value={this.state.selectedTopic} options={self.state.topics} onChange={self.changeTopic} />)

        return (
            <div>
                <Rodal
                  customStyles={{position: "absolute", height: "430px", top: (this.state.selectedObject.y) + 'px', left: (this.state.selectedObject.x) + 'px'}}
                  visible={this.state.visible} onClose={this.hide.bind(this)}>
                  <div >
                      <p>Name: {objName} {myBtn}</p>
                      <p>Topic: {topicList}</p>
                      <div style={{height: 300, overflow: 'scroll'}}>
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
