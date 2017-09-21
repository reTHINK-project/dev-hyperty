export default function ActionsCall({call, videoCall, onChangeDomain, resolveDomain, domain, email}){
  return (<div className="row">
            <form className="col s12">
                <div className="input-field col s6">
                    <label className="sr-only" htmlFor="address">Address</label>
                    <input type="email" onChange={resolveDomain} className="form-control" id="address" placeholder="Address" value={email}/>
                </div>
                <div className="input-field col s6">
                    <label className="sr-only" htmlFor="domain">Domain</label>
                    <input type="text" onChange={onChangeDomain} className="form-control" id="domain" placeholder={domain}/>
                </div>
                <a href="#" onClick={call} className="btn-floating btn-large waves-effect waves-light red"><i className="material-icons">phone</i></a>&nbsp;&nbsp;
                <a href="#" onClick={videoCall} className="btn-floating btn-large waves-effect waves-light red"><i className="material-icons">videocam</i></a>
            </form>
        </div>);
}

