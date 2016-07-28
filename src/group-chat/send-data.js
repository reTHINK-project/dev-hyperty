import GroupChatFile from './GroupChatFile'
import PeerConnection from './peer-connection'

export const SendData = {
    onReceiveMessage(data){
        if (typeof data === 'string') {
            this.buf = parseInt(data)
            return
        }

        this.receiveBuffer.push(data)
        this.receivedSize += data.byteLength

        if (this.receivedSize === this.buf) {
            let received = new window.Blob(this.receiveBuffer)
            this.receiveBuffer = []
            this.receivedSize = 0

            let url = URL.createObjectURL(received)
            this.messages.push(GroupChatFile({ file:url, startingTime:Date.now()}, true, {}))

            this._callback(this.messages[this.messages.length-1])
        }
    },

    sendFile(file){
        this.peer.open()
            .then(connection=>{
                connection.onData(this.onReceiveMessage.bind(this))
                connection.sendData(file.size)
                let chunkSize = 16384
                let sliceFile = (offset)=> {
                    let reader = new window.FileReader()
                    reader.onload = (()=>{
                        return function(e) {
                            connection.sendData(e.target.result)
                            if (file.size > offset + e.target.result.byteLength) {
                                window.setTimeout(sliceFile, 0, offset + chunkSize)
                            }
                        }
                    })(file)
                    var slice = file.slice(offset, offset + chunkSize)
                    reader.readAsArrayBuffer(slice)
                }
                sliceFile(0)
            })
    },

    onMessage(callback){
        this.onAddChild((message, identity)=>{
            this._callback = callback
            this._processTextMessages(message, identity, callback)
            this.peerMessage(message)
        })
    }
}

export function addSendDataIfSupported(chat){
    if(chat.participants.length === 2){
		let initialData = {}
        let peer = PeerConnection({sendMessage: chat.addChild, onMessage: (callback)=>initialData.peerMessage=(msg)=>callback(msg)})
        chat = Object.assign(chat, SendData, initialData, {peer: peer})

        peer.onConnection((connection)=>{
            connection.onData(chat.onReceiveMessage.bind(chat))
        })
    }

    return chat
}
