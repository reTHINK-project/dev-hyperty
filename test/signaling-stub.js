const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || 
                        window.webkitRTCPeerConnection

export default function (connection){

    return {
        _callback: undefined,

        sendMessage: function(msg){
            console.log('sendMessage', msg)
            if(msg.type==='ICE_CANDIDATE')
                connection.addIceCandidate(msg.data)
            if(msg.type==='SDP_OFFER'){
                connection.setRemoteDescription(msg.data)
                if(!connection.localDescription.sdp){
                    connection.createAnswer().then(
                       (desc)=>{
                           connection.setLocalDescription(desc)
                           this._callback({ type: 'SDP_OFFER', data: desc.toJSON() })
                       })
                }
            }
        },
        
        onMessage:function(callback){
            this._callback = (msg)=>{
                console.log('onMessage', msg)
                callback(msg)
            }
        }
    }
}
