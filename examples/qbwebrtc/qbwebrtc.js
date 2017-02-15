import ActionPanel from './ActionPanel'
import Logo from './Logo'
import HypertyInfo from './HypertyInfo'
import VideoPanel from './VideoPanel'
import StatusPanel from './StatusPanel'

const Main = React.createClass({
    call(email, domain, constraints={audio:true, video:false}) {
        console.log('call', {email:email, domain:domain, constraints:constraints})
        const hyperty=this.props.hyperty;
        hyperty.discovery.discoverHypertyPerUser(email, domain)
            .then(result => {
                this.setState({ address: result.hypertyURL });    
                hyperty.setIceServer([{
                  urls: "turn:numb.viagenie.ca",
                  username:  "steffen.druesedow@telekom.de",
                  credential: "w0nd3r"
                }], null);
                hyperty.setMediaOptions(constraints);
                hyperty.connect(result.hypertyURL)
                    .then((obj) => {
                        this.setState({callStatus:'RINGING'})
                    });
            }).catch(console.error);
    },

    videoCall(email, domain) {
        console.log('videoCall')
        this.call(email, domain, {audio:true, video:true});
    },

    resetState() {
        this.setState({ callStatus: '', address: '', remoteVideo: '', localVideo: ''});
    },

    hangup() {
        this.props.hyperty.disconnect()
        this.resetState()
    },

    acceptCall() {
        this.props.hyperty.acceptCall()
        this.setState({callStatus: 'IN_A_CALL'})
    },

    getInitialState(){
      this.props.hyperty.addEventListener('remotevideo', (stream) => this.setState({remoteVideo: stream, callStatus: this.state.callStatus==='INCOMING_CALL'?'INCOMING_CALL':'IN_A_CALL'}));
      this.props.hyperty.addEventListener('localvideo', (stream) => this.setState({localVideo: stream}));
      this.props.hyperty.addEventListener('disconnected', () => { console.log('dis-j'); this.resetState();});
      this.props.hyperty.addEventListener('incomingcall', (identity)=> this.setState({callStatus: 'INCOMING_CALL'}));

      return { callStatus: '', address: '', remoteVideo: '', localVideo: ''};
    },

    render() {
        const actionProps = {...this.props, call: this.call, videoCall: this.videoCall, callStatus: this.state.callStatus, hangup: this.hangup, acceptCall: this.acceptCall };
        const hypertyProps = {runtimeHypertyURL:this.props.runtimeHypertyURL, ...this.props.identity};

        return (<div className="container-fluid">
                <Logo />
                <HypertyInfo {...hypertyProps}/>
                <ActionPanel {...actionProps}/>
                <VideoPanel remoteVideo={this.state.remoteVideo} localVideo={this.state.localVideo} />
                <StatusPanel state={this.state.callStatus} address={this.state.address}/>
        </div>);
    }
});

export default function hypertyLoaded(result) {
    result.instance.identityManager.discoverUserRegistered()
        .then((identity) => {
            const element = <Main identity={identity} runtimeHypertyURL={result.runtimeHypertyURL} hyperty={result.instance} />;
            ReactDOM.render(element, document.getElementById('root'));
        }).catch(console.error);
}
