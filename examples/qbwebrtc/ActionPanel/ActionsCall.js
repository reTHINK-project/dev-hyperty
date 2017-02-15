export default function ActionsCall({call, videoCall, onChangeDomain, resolveDomain, domain, email}){
  return (<div className="row">
            <form className="form-inline">
                <div className="form-group">
                    <label className="sr-only" htmlFor="address">Address</label>
                    <input type="email" onChange={resolveDomain} className="form-control" id="address" placeholder="Address" value={email}/>
                </div>
                <div className="form-group">
                    <label className="sr-only" htmlFor="domain">Domain</label>
                    <input type="text" onChange={onChangeDomain} className="form-control" id="domain" placeholder={domain}/>
                </div>
                <a href="#" onClick={call} className="btn btn-default">Call</a>
                <a href="#" onClick={videoCall} className="btn btn-default">VideoCall</a>
            </form>
        </div>);
}

