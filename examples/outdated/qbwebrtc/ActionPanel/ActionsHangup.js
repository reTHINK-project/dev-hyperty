const ActionsHangup = ({hangup}) => {
  return (<div className="row">
            <form className="form-inline">
                <a href="#" onClick={hangup} className="btn-floating btn-large waves-effect waves-light red"><i className="material-icons">call_end</i></a>
            </form>
        </div>);
}

export default ActionsHangup
