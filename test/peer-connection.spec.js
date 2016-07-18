import { expect } from 'chai'
import PeerConnection from '../src/group-chat/peer-connection'
import Signaling from './signaling-stub'
const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || 
                        window.webkitRTCPeerConnection

let connection = undefined
let signaling = undefined

describe('peerConnection', ()=>{
    beforeEach(()=>{
        connection = new RTCPeerConnection(null, null)
        signaling = Signaling(connection)

        connection.onicecandidate = (event)=>{
            if(event.candidate)
                signaling._callback({type:'ICE_CANDIDATE', data: event.candidate})
        }
    })

    describe('send text', ()=>{
        it('should send a message', (done)=>{
            connection.ondatachannel = (event)=>{
                let channel = event.channel
                channel.binaryType = 'arraybuffer'
                channel.onmessage = (msg)=>{
                    expect(msg.data).to.be.equal('hello')
                    done()
                }
            }

            let peer = PeerConnection(signaling)

            peer.open()
                .then(connection=>{
                    connection.sendData('hello')
                })

        })
    })

    describe('receive text', ()=>{
        it('should recive a message', (done)=>{
            let channel = connection.createDataChannel('dataChannel', null)
            channel.onopen = ()=>channel.readyState==='open'?channel.send('hello'):''
            connection.createOffer().then((desc)=>{
                connection.setLocalDescription(desc)
                signaling._callback({type: 'SDP_OFFER', data:desc.toJSON() })
            })

            let peer = PeerConnection(signaling)

            peer.onConnection((connection)=>{
                connection.onData((data)=>{
                    expect(data).to.be.equal('hello')
                    done()
                })    
            })
        })
    })

    describe('conversation', ()=>{
        it('should send and receive messages', (done)=>{
			let callbackCaller = undefined
			let callbackCallee = undefined
			let callback_caller = (msg)=>{
				console.log('caller onMessage', msg)
				callbackCaller(msg)
			}
			let callback_callee = (msg)=>{
				console.log('callee onMessage', msg)
				callbackCallee(msg)
			}

 			let signaling = (callbackSource, callbackTarget)=>{
				return {
					sendMessage: function(msg){
						console.log(' sendMessage', msg)
					    callbackTarget(msg)
					},
			
					onMessage:function(callback){
						callbackSource(callback)
					}
				}
			}

            let peer_caller = PeerConnection(signaling((callback)=>callbackCaller=callback, callback_callee))
            let peer_callee = PeerConnection(signaling((callback)=>callbackCallee=callback, callback_caller))

			peer_callee.onConnection((connection)=>{
				connection.onData((data)=>{
					expect(data).to.be.equal('hello')
					connection.sendData('bye')
				})
			})

            peer_caller.open()
                .then(connection=>{
                    connection.onData((data)=>{
                        expect(data).to.be.equal('bye')
                        done()
                    })
                    connection.sendData('hello')
                })

        })
    })
})

