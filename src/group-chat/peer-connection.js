const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection
					|| window.mozRTCPeerConnection

export default function PeerConnection(signaling){
    let connection = undefined
    let channel = undefined
    let handleOnConnection = undefined
    let handleOnData = undefined
    let _sendData= (data)=>{
        if(channel.readyState === 'open'){
            channel.send(data)
        }else{
            setTimeout(function(){_sendData(data)}, 100)
        }
    }

    let cn = {
        sendData: _sendData,

        onData:(handler)=>{
            handleOnData = handler
        }
    }

    connection = new RTCPeerConnection(null, null)

    connection.onicecandidate = (event)=>{
        if (event.candidate) {
            signaling.sendMessage({type:'ICE_CANDIDATE', data: event.candidate.toJSON() })
        }
    }

    connection.ondatachannel = (event)=>{
        channel = event.channel
        channel.binaryType = 'arraybuffer'
        channel.onmessage = (msg) => {
            if(!!handleOnData)
                handleOnData(msg.data)
        }
    }

    signaling.onMessage((message) => {
        if(message.type === 'ICE_CANDIDATE'){
            connection.addIceCandidate(message.data)
        }else if(message.type === 'SDP_OFFER'){
            connection.setRemoteDescription(message.data)
            if(!connection.localDescription.sdp){
                connection.createAnswer().then(
                   (desc)=>{
                       connection.setLocalDescription(desc)
                       signaling.sendMessage({ type: 'SDP_OFFER', data: desc.toJSON() })
                       if(!!handleOnConnection)
                           handleOnConnection(cn)
                   })
            }
        }
    })

    return {
        open: ()=>{
            return new Promise((resolve, reject)=>{
                if(!channel){
                    channel = connection.createDataChannel('sendDataChannel', null)
                    channel.onmessage = (msg) => {
                        if(!!handleOnData)
                            handleOnData(msg.data)
                    }
                    connection.createOffer().then((offer)=>{
                        connection.setLocalDescription(offer)
                        signaling.sendMessage({type: 'SDP_OFFER', data: offer.toJSON()})
                    })
                }
                resolve(cn)
            })
        },
        
        onConnection: (handler)=>{
            handleOnConnection = handler
        },

        close:()=>{}
    }
}
