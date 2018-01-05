const ActionsIncomingCall = ({acceptCall, rejectCall}) => {
  return (<div className="row">
            <form className="col s12">
                <a href="#" onClick={acceptCall} className="btn-floating btn-large waves-effect waves-light red"><i className="material-icons">phone</i></a>&nbsp;&nbsp;
                <a href="#" onClick={rejectCall} className="btn-floating btn-large waves-effect waves-light red"><i className="material-icons">call_end</i></a>
            </form>
        </div>);
}

export default ActionsIncomingCall
