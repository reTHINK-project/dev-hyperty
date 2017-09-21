import ActionsCall from './ActionsCall'
import ActionsHangup from './ActionsHangup'
import ActionsIncomingCall from './ActionsIncomingCall'

const ActionPanel = React.createClass({
  getInitialState(){
    return { domain: 'Domain', email: '' }
  },

  render() {
    if(this.props.callStatus === 'IN_A_CALL')
    {
        return <ActionsHangup hangup={this.props.hangup}/>
    } else if (this.props.callStatus === 'INCOMING_CALL') {
        return <ActionsIncomingCall acceptCall={this.props.acceptCall} rejectCall={this.props.hangup}/>
    }else {
        const actionsProp = { email: this.state.email, domain: this.state.domain, 
                                onChangeDomain: this.changeDomain, 
                                resolveDomain: this.resolveDomain, 
                                call:()=>this.props.call(this.state.email, this.state.domain),
                                videoCall:()=>this.props.videoCall(this.state.email, this.state.domain)
                            };
        return <ActionsCall {...actionsProp}/>;
    }
  },

  changeDomain(event) {
    this.setState({domain: event.target.value});
  },

  resolveDomain(event) {
    this.setState({email: event.target.value})
    const parts = event.target.value.split('@');
    if(parts.length>1)
        this.setState({domain: parts[1]});
  }
})

export default ActionPanel
