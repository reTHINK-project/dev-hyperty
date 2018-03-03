---
layout: hyperty
title:  "Citizen Hyperty"
description: "Observes Citizens "
date:   2018-04-01
author: ?
categories:
- smart_citizen
img: citizen.png
thumb: citizen.png
tagged: smart_city
client: Sharing Cities Project
demo: /demos/citizen/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/citizen
---

The Citizen Hyperty monitors a user's behavior in a Smart Citizen environment.

This Hyperty observes a standard [Context Data Object](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/context) with:

*to be completed*

**Hyperty Resource Type**

* learning_credits
* checkin
* eCar
* eBike
* walk
* eMotobike

**ContextUnit**

-	pres: user availability status in one of these values: available, unavailable, away, busy

**example**

```json
{
 "scheme": "context",
 "id": "1276020076",
 "time": 1465070579,
 "values": [ {
  "type": "availability_context",
  "unit": "pres",
  "value": 'available' } ]
}
```


## API

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
