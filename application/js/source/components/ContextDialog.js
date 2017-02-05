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

    handleClick(e) {
        console.log('this is:', e.target.id);
      }


      render() {

        let myBtn = (<button id="closebtn" onClick={this.props.onClick} >Close and save</button>)

        let self=this
        return (
            <div>
                <Rodal
                  customStyles={{position: "absolute", top: (this.state.selectedObject.y) + 'px', left: (this.state.selectedObject.x) + 'px'}}
                  visible={this.state.visible} onClose={this.hide.bind(this)}>
                  <div >
                      Name: {this.state.selectedObject.name} {myBtn}
                  </div>
                </Rodal>
            </div>
        )
      }



}

export default ContextDialog;
