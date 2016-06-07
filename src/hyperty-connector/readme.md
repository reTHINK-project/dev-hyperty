
Connector Hyperty
-----------------

The Connector Huperty main functionality is to handle two party audio and voice conversations.

![Architecture](connector-arch.png)

As depicted above, the Connector Hyperty comprises the Connector class that handles the creation of new outgoing or incoming connections. Each Connection instance is controlled by the ConnectionController class that uses the the native WebRTC API.

The Connection signalling is handled by the Reporter-Observer data synchronisation mechanism, by using the standard [Connection Data schema](https://github.com/reTHINK-project/architecture/tree/master/docs/datamodel/connection).


Full documentation is provided [here](../../docs/hyperty-connector)
