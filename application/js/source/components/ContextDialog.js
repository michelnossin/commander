import React from 'react';
import Rodal from 'rodal';


class ContextDialog extends React.Component {

    constructor(props) {
        super(props);

        this.state = { visible: props.visible , selectedObject: props.selectedObject};
    }


    show() {
        this.setState({ visible: true });
    }

    hide() {
        this.setState({ visible: false });
        this.props.onClick()
    }

    onHandleChange(e) {
      var stateCopy = Object.assign({}, this.state);
        
      stateCopy.selectedObject.name = e.target.value
      this.setState(stateCopy);

      this.props.onChange(this.state.selectedObject)
    }
//    handleClick(e) {
//        console.log('this is:', e.target.id);
//      }

      render() {

        let myBtn = (<button id="closebtn" onClick={this.props.onClick} >Close Dialog</button>)
        let objName = (<input id="objname" type="text" value={this.state.selectedObject.name}
                              onChange={this.onHandleChange.bind(this)} />)

        let self=this
        return (
            <div>
                <Rodal
                  customStyles={{position: "absolute", top: (this.state.selectedObject.y) + 'px', left: (this.state.selectedObject.x) + 'px'}}
                  visible={this.state.visible} onClose={this.hide.bind(this)}>
                  <div >
                      Name: {objName} {myBtn}
                  </div>
                </Rodal>
            </div>
        )
      }



}

export default ContextDialog;
