---
layout: hyperty
title:  "Hello World Observer"
description: "Monitors Hello Data Object Changes"
date:   2015-06-01
author: Paulo Chainho
categories:
- hello-world
img: hello-world-observer.png
thumb: hello-world-observer.png
tagged: hello-world
client: reTHINK Project
demo: /demos/hello-world-observer/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/HelloWorldObserver
---

The Hello World Observer is a very simple Hyperty to illustrate how Observer Hyperties work. It works together with Hello World Reporter Hyperty and automatically accepts invitations from it to observe changes made on the `hello` Data Object.

This Hyperty handles a simple hello Data Object:

```json
{
	"$schema": "http://json-schema.org/draft-04/schema#",
	"id": "HelloObject",
	"type": "object",
	"required": ["hello"],
  "properties": {
		"scheme": {
			"constant": "hello"
		},
		"hello": {
			"type": "string"
		}
	}
}
```

## API

The HelloWorldObserver only provides an event handler to the Application to be notified about invitation events from the HelloWorldReporter and events about changes made on the hello Data Object.

### addEventListener for Invitations

This function allows to add a callback for invitation events coming from the HelloWorldReporter to be an Observer of the `hello` Data Object. Invitations are automatically subscribed by the Hyperty and events are .

```javascript
 addEventListener('invitation', function( Useridentity user) {...})
```

**parameters**

**function callback** the function executed when an invitation event is triggered with the Identity information about the user associated to the inviting Hyperty.

**How to use it**

```javascript
hyperty.instance.addEventListener('invitation', function(identity){
	console.log('Invitation coming from user: ', identity.userProfile);
});
```

### addEventListener for changes on Data Object 'hello'

 This function allows to add a callback function to be executed when there are changes on the `hello` Data Object. The changes event contains the 'hello' Data Object.

 ```javascript
  addEventListener('hello', function( HelloEvent event) {...})
 ```

 **parameters**

 **function callback** the function executed when a change event is triggered with the 'hello' Data Object.

 **How to use it**

 ```javascript
 hyperty.instance.addEventListener('hello',function(event){
 	console.log('New value for Hello Data Oject: ', event.hello);
 });
```


### Descriptor

The Hyperty descriptor is:

```json
"HelloWorldObserver": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "HelloWorldObserver",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": ["hello"],
  "cguid": 10004,
  "version": "0.1",
  "description": "Descriptor of HelloWorldObserver Hyperty",
  "objectName": "HelloWorldObserver",
  "configuration": {},
  "sourcePackageURL": "/sourcePackage",
  "language": "javascript",
  "signature": "",
  "messageSchemas": "",
  "dataObjects": [
    "https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/dataschema/HelloWorldDataSchema"
  ],
  "accessControlPolicy": "somePolicy"
}
```
