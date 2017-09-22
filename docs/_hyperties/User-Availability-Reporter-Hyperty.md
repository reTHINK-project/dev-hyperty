---
layout: hyperty
title:  "User Availability"
description: "Publishes what is the User Availability to Communicate (Presence)"
date:   2017-02-01
author: Paulo Chainho
categories:
- availability
img: user-availability.jpg
thumb: user-availability.jpg
tagged: presence
client: reTHINK Project
demo: https://rethink-project.github.io/dev-hyperty/demos/user-availability-observer/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/UserAvailabilityObserver
---


The User Availability Reporter manages user availability state ('available', 'unavailable', 'busy', 'away') by publishing it to a certain Context Resource URL and handling subscriptions requests from User Availability Observer.

This Hyperty handles a standard [Context Data Object](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/context) with:

**Hyperty Resource Type**

* AVAILABILITY_CONTEXT

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

The UserAvailabilityReporter Hyperty provides an API to let the Application set the User Availability status. When the Hyperty starts the first time it creates a new Context object that is re-used for the next sessions.

### start

This function starts the user availability reporting by setting the subscriptions handler and returning the UserAvailability Data Object. Currently, the subscriptions handler automatically accepts all subscriptions requests. If no UserAvailability objects exists to be resumed, a new one is created.

```javascript
<Promise> DataObjectReporter start()
```

**parameters**

No input parameter.

**returns**

A promise with UserAvailability DataObjectReporter.

### setStatus

This function sets a new value to UserAvailability status and triggers a `my-availability-update` event that the App may listen to.

```javascript
setStatus( string newStatus )
```

**parameters**

*newStatus* the new value of user availability


## Descriptor

The Hyperty descriptor is:

```json
"UserAvailabilityReporter": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "UserAvailabilityReporter",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": ["availability_context"],
  "cguid": 10004,
  "version": "0.1",
  "description": "Descriptor of UserAvailabilityReporter Hyperty",
  "objectName": "UserAvailabilityReporter",
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
