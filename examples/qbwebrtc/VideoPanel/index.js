const VideoPanel = ({remoteVideo, localVideo}) => {
    let content;
    if(remoteVideo) {
        return(<div className="row">
                        <div className='col-xs-2'>
                            <div className="embed-responsive embed-responsive-4by3">
                                <video className="embed-responsive-item" autoPlay muted='true' src={localVideo?URL.createObjectURL(localVideo):''}/>
                            </div>
                        </div>
                        <div className="col-xs-10">
                            <div className="embed-responsive embed-responsive-4by3">
                                <video className="embed-responsive-item" autoPlay src={URL.createObjectURL(remoteVideo)}/>
                            </div>
                        </div>
                    </div>);
    }

    return (<div></div>);
}

export default VideoPanel
