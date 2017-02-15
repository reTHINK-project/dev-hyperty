const ActionsHangup = ({hangup}) => {
  return (<div className="row">
            <form className="form-inline">
                <a href="#" onClick={hangup} className="btn btn-default">HANGUP</a>
            </form>
        </div>);
}

export default ActionsHangup
