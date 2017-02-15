const VideoPanel = ({remoteVideo, localVideo}) => {
    let content;
    if(remoteVideo) {
        return(<div className="row">
                        <div className='col-xs-2'>
                            <video autoPlay muted='true' src={localVideo?URL.createObjectURL(localVideo):''}/>
                        </div>
                        <div className="col-xs-10">
                            <video autoPlay src={URL.createObjectURL(remoteVideo)}/>
                        </div>
                    </div>);
    }

    return (<div></div>);
}

export default VideoPanel
