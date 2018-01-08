
DTWebRTC Hyperty
-----------------

##1. Functionality description

The DTWebRTC Hyperty provides functionalities for the establishment and handling of WebRTC A/V connections between two peers. It uses the same Data Object scheme as the [Connector Hyperty](https://github.com/reTHINK-project/dev-hyperty/tree/master/docs/connector) and is therefore interoperable with this other hyperty implementation.

This Hyperty fully encapsulates the WebRTC actions including the calls to the getUserMedia-API. The application can initiate actions of the hyperty via method calls and receives events from the hyperty.

This Hyperty handles standard [Connection Data Objects](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/connection).


##2. Exposed API
The DTWebRTC exposes following API to be used by applications:

```
NOTE: The API is preliminary and needs a revision, completion and cleanup.
```

### Hyperty methods

#### connect

This function is used to create a new connection providing the identifier/url of the target hyperty of the peer user. This URL is normally the result of a previous hyperty discovery at the peer users target domain. The discovery process itself is not part of the DTWebRTC hyperty. It must happen before in the scope of the application.

`<Promise>  connect( hypertyURL )`


**parameters**

*hypertyURL* - The url of a hyperty-instance which is the communication endpoint of the target user.

**returns**

A Promise that resolves, if the invitation has been sent and our hyperty has received a subscription request for our reporter Data object.

It fails with a reason, if something went wrong.

**How to use it**

```javascript
connector.connect().then( () => {

  // your source code

}).catch( (reason) {
    console.error(reason);
});
```

#### addEventListener

This function is used to add listeners to events emitted by the DTWebRTC hyperty. The full list of events is documented below.

`addEventListener(eventName, callback(parameters))`


**parameters**

*eventName* - The name of the event to subscribe a listener for.
*callback* - A callback function that is invoked, when the hyperty emits the subscribed events. The parameters of the event callback are event specific.

**How to use it**

```javascript
hyperty.addEventListener('invitation', (identity) => {
  // preparing a dialog with the given identity info
  console.log('incomingcall event received from:', identity);
  // ...
});
```


#### invitationAccepted

This function is used to accept an incoming call request received by the `incomingcall(data)` event.

`invitationAccepted(data)`

**parameters**

*data* - the data that was received in the `incomingcall` event
#### acceptCall

This function is used to accept an incoming call request received by the `incomingcall()` event.

`acceptCall()`
>>>>>>> develop


**How to use it**

```javascript
hyperty.addEventListener('incomingcall', (data) => {
  $('#myModal').find('#btn-accept').on('click', () => {
    hyperty.invitationAccepted(data);
  });
```

#### setIceServer

This function can be used to set/modify the ICE-Server configuration that the DTWebRTC hyperty uses to establish a WebRTC connection. It can be used for instance to force the use of a specific TURN server.

`setIceServer(iceServers, mode)`

**parameters**

*iceServers* - a specification conform array holding STUN and TURN server configurations
*mode* - a boolean defining whether this iceServer data shall replace or extend the internal DTWebRTC ICE-Server configuration (true : replace, false : extend)


**How to use it**

```javascript
var iceServers = [];
iceServers.push({
  urls: "stun:" + stun
});
iceServers.push({
  urls: "turn:" + turn,
  username: turn_user,
  credential: turn_pass
});
hyperty.setIceServer(iceServers, false);
```

#### switchLocalAudio

This function is used to enable/disable the local audio during a running WebRTC session.

`switchLocalAudio(newState)`

**parameters**

*newState* - the requested state of the local audio

**How to use it**

```javascript
hyperty.switchLocalAudio(false);
```

#### switchLocalVideo

This function is used to enable/disable the local video during a running WebRTC session.

`switchLocalVideo(newState)`

**parameters**

*newState* - the requested state of the local video

**How to use it**

```javascript
hyperty.switchLocalVideo(false);
```

#### disconnect

This function is used to close an existing WebRTC connection.

`<Promise> disconnect()`

**returns**

It returns a Promise that resolves on success or rejects, if some cleanup actions failed.

**How to use it**

```javascript
hyperty.disconnect().then(() => {

// your source code

}).catch(function(reason) {
    console.error(reason);
});
```

### Hyperty events

<<<<<<< HEAD
<<<<<<< HEAD
#### invitation

This event is emitted when the hyperty receives an invitation to subscribe as observer for a remotely created dataObject. It is an "early phase notification" before the synchronization path between calling and called hyperty is established. It carries the identity of the inviting peer user as parameter.

`invitation(identity)`

**parameters**

*identity* ... the identity of the caller (with several fields describing the caller)

**How to use it**

```javascript
hyperty.addEventListener('invitation', (identity) => {
  console.log('incomingcall event received from:', identity);
  // prepare a dialog with the given identity info
}
```

#### incomingcall

This event is emitted when the hyperty received an invitation and has established the synchronization path between itself and the calling hyperty. It carries the WebRTC offer as parameter.

`incomingcall(data)`

**parameters**

*data* ... invitation data that must be passed to invitationAccepted (This will change in future versions.)
#### incomingcall

This event is emitted when the hyperty received an invitation and has established the synchronization path between itself and the calling hyperty.  It carries the identity of the inviting peer user as parameter.

`incomingcall(identity)`

>>>>>>> develop

**How to use it**

```javascript
<<<<<<< HEAD
hyperty.addEventListener('incomingcall', (data) => {
  $('#myModal').find('#btn-accept').on('click', () => {
    hyperty.invitationAccepted(data);
hyperty.addEventListener('incomingcall', (identity) => {
  // display caller identity and present a modal dialog
  $('#myModal').find('#btn-accept').on('click', () => {
    hyperty.acceptCall();
>>>>>>> develop
  });
  // show notification dialog
}
```

#### localvideo

This event is emitted when the hyperties has successfully invoked "getUserMedia" to receive a local A/V stream. The stream itself is provided as parameter and can be set to the corresponding video element of the user interface.

`localvideo(stream)`

**parameters**

*stream* ... the stream to be attached to the video element of the GUI

**How to use it**

```javascript
hyperty.addEventListener('localvideo', (stream) => {
  console.log('local stream received');
  document.getElementById('localVideo').srcObject = stream;
});
```

#### remotevideo

This event is emitted when the hyperties has received a remotevideo event from its PeerConnection. It indicates that the connection is established successfully. The stream itself is provided as parameter and can be set to the corresponding video element of the user interface.

`remotevideo(stream)`

**parameters**

*stream* ... the stream to be attached to the video element of the GUI

**How to use it**

```javascript
hyperty.addEventListener('remotevideo', (stream) => {
  console.log('local stream received');
  document.getElementById('remoteVideo').srcObject = stream;
});
```

#### onDisconnect

This event is emitted when the connection has been closed (either from remote or local side).

`disconnected()`

**parameters**


**How to use it**

```javascript
hyperty.addEventListener('disconnected', () => {
  console.log('>>>disconnected');
  // do cleanup work
}
```
