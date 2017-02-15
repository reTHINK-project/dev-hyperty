const ActionsIncomingCall = ({acceptCall, rejectCall}) => {
  return (<div className="row">
            <form className="form-inline">
                <a href="#" onClick={acceptCall} className="btn btn-default">ACCEPT</a>
                <a href="#" onClick={rejectCall} className="btn btn-default">REJECT</a>
            </form>
        </div>);
}

export default ActionsIncomingCall
