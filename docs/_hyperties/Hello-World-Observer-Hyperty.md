---
layout: hyperty
title:  "Hello World Observer"
description: "Monitors Hello Data Object Changes"
date:   2016-02-01
author: Paulo Chainho
categories:
- hello-world
img: hello-world-observer.jpg
thumb: hello-world-observer.jpg
tagged: hello-world
client: reTHINK Project
demo: https://rethink-project.github.io/dev-hyperty/demos/hello-world-observer/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/HelloWorldObserver
---

The Hello World Observer is a very simple Hyperty to illustrate how Observer Hyperties work. It works together with Hello World Reporter Hyperty. It automatically accepts invitations from the Hello World Reporter and subscribes to changes on  the `hello` Data Object.

This Hyperty handles a simple hello Data Object:

*insert hello json-schem*

## API

The is no Application specifc API ...
The UserAvailabilityObserver Hyperty provides an API to discover and observe multiple users publishing availability status. The App has to set one listener per observed user to receive events about availability status change.

### start

This function starts user availability status observation and returns one array of UserAvailabilityController instance. For each one, the App has to set a onChange event handler (see below). If no users exist to observe, it returns `false`.

```javascript
<Promise> UserAvailabilityController[] || boolean start()
```

**parameters**

No input parameter.

**returns**

A promise with an array of UserAvailabilityController instances.

### discoverUsers

This function discovers Hyperties used by users to publish availability status.

```javascript
<Promise> HypertyInstance[] discoverUsers( string email, string ?domain )
```

**parameters**

*email* the user identifier
*domain* (optional) the domain providing the Hyperty

**returns**

A promise with an array of discovered HypertyInstance.

### observe

This function starts the observation of the availability status managed by a certain Hyperty.

```javascript
<Promise> UserAvailabilityController observe( HypertyURL hypertyID )
```

**parameters**

*hyperty* the DiscoveredObject of the Hyperty to be observed

**returns**

A promise with the UserAvailability Data Object Observer for a certain user.

### unobserve

This function stops the observation of the availability status for a certain user.

```javascript
unobserve( ContextURL availability )
```

**parameters**

*availability* the UserAvailability Data Object Observer URL to be unobserved


### Monitor changes to UserAvailability status

Every change of the status triggers a `onChange` event of the observed Data:

```javascript
userAvailability.onChange('*', (event) => {
	console.log('New User Availability status :', userAvailability.data.values[0].value);

});
```


### Descriptor

The Hyperty descriptor is:

```json
"UserAvailabilityReporter": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "UserAvailabilityObserver",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": ["availability_context"],
  "cguid": 10004,
  "version": "0.1",
  "description": "Descriptor of UserAvailabilityObserver Hyperty",
  "objectName": "UserAvailabilityObserver",
  "configuration": {},
  "sourcePackageURL": "/sourcePackage",
  "language": "javascript",
  "signature": "",
  "messageSchemas": "",
  "dataObjects": [
    "https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/dataschema/Context"
  ],
  "accessControlPolicy": "somePolicy"
}
```

Since the Hyperty supports the standard context data schema, any Catalog URL for that schema can be used.
