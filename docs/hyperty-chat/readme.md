Group Chat Hyperty
------------------

##1. Functionality description

The Group Chat main functionality is to handle Text conversations among groups, including:

* creation of a new Group Chat with possibility to invite users to join it
* notification about invitation to join a Group Chat with options to accept or reject
* send message to group
* receive message from group with identity from sender


##1.1 Hyperty Data Objects schemas

This Hyperty handles standard [Communication Data Objects](https://github.com/reTHINK-project/dev-service-framework/blob/develop/docs/datamodel/data-objects/communication/readme.md) constrained for Chat Communications i.e. the hypertyResource type is `chat`.

##1.2 Descriptor

The Group Chat Hyperty descriptor is:

```
"HypertyChat": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "HypertyChat",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": [
    "chat"
  ],
  "cguid": 10004,
  "version": "0.1",
  "description": "Description of HypertyChat",
  "objectName": "HypertyChat",
  "configuration": {},
  "sourcePackageURL": "/sourcePackage",
  "language": "javascript",
  "signature": "",
  "messageSchemas": "",
  "dataObjects": [
    "https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/dataschema/Communication"
  ],
  "accessControlPolicy": "somePolicy"
}
```

Since the Hyperty supports the standard communication data schema, any Catalog URL for that schema can be used.

##2. Exposed API

The Group Chat Hyperty implements two APIs to be consumed by Applications:

* the Group Chat Manager API manages the creation of new Group Chats;
* the Hyperty Group Chat API manages a certain Group CHat instance.


#### Hyperty Group Chat Manager API (HypertyChat)

The Hyperty Group Chat Manager API is used to manage new Chat Group conversations.

##### create

This function is used to create a new Group Chat providing the name and the identifiers of users to be invited.

**parameters**

**How to use it**

##### onInvitation

This function is used to handle notifications about incoming invitations to join a Group Chat.

**parameters**

**How to use it**


##### join

This function is used to join a Group Chat.

**parameters**

**How to use it**


#### Hyperty Group Chat API

The Group Chat API is used to control a Group Chat  instance.

**parameters**

**How to use it**


##### send

This function is used to send a chat message.

**parameters**

**How to use it**


##### onMessage

This function is used to receive new messages.

**parameters**

**How to use it**


##### onClose

This function is used to receive requests to close the Group Chat instance.

**parameters**

**How to use it**


##### close

This function is used to close an existing Group Chat instance.

**parameters**

**How to use it**


##### addParticipant

This function is used to add / invite new participant on an existing Group Chat instance.

**parameters**

**How to use it**


##### removeParticipant

This function is used to remove a participant from an existing Group Chat instance.


**parameters**

**How to use it**
