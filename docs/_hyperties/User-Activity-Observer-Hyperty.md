---
layout: hyperty
title:  "User Activity Observer Hyperty"
description: "Monitors User Activity Context"
date:   2018-05-01
author: ?
categories:
- user_activity
img: user-activity.png
thumb: user-activity.png
tagged: user_activity
client: Sharing Cities Project
demo: /demos/user-activity-observer/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/UserActivityObserver
---

The User Activity Observer Hyperty monitors user's Activity (e.g. walking, biking, running, etc) by observing a standard [Context Data Object](https://github.com/reTHINK-project/specs/tree/master/datamodel/data-objects/context) with:

**Hyperty Resource Type**

* USER_WALKING_CONTEXT
* USER_RUNNING_CONTEXT
* USER_BIKING_CONTEXT


**ContextUnit**

-	meter: distance

**example**

```json
{
	"scheme": "context",
     "id": "1276020076",
     "time": 1465070579,
     "values": [
      {
				"type": "user_walking_context",
				"name": "walking distance in meters",
         "unit": "meter",
         "value": 1500,
         "startTime": "2018-03-25T12:00:00Z",
         "endTime": "2018-03-25T12:10:00Z"
        },
			 {
         "type": "user_biking_context",
 				"name": "biking distance in meters",
          "unit": "meter",
          "value": 5000,
          "startTime": "2018-03-26T12:00:00Z",
          "endTime": "2018-03-26T12:10:00Z"
      }
     ]
}
```

## API


The User Activity Hyperty provides an API to the Application to discover and connect to sources of user activity data. These functions are only required to be used once. By default, the Hyperty automatically connects and starts reading sources that were connected the last time.

### configuration

The User Activity configuration comprises the definition of source discovery endpoints:

```
{
  discoveryProviders: [<provider-domain>]
}
```


### discover

This function discovers available user activity sources.

```javascript
<Promise> Context.Context[] discover()
```

**parameters**

No input parameter.

**returns**

A list of Context objects is returned as a Promise. Each Context object contains:

context.id : source id e.g. google fit api endpoint

context.name : name of the source eg Google FIT

context.description : additional information about the source (optional)

### connect

This function connects to a certain previously discovered user activity source and starts reading it.

```javascript
<Promise> Context connect( string id, options ?options )
```

**parameters**

*id* source identity returned by the discover function ie context.id

*options* is of type Options where measurement frequency is defined (is it required?).

**returns**

returns as a promise the subscribed User Activity Context Data Object.


### Descriptor

*to be updated*

The Hyperty descriptor is:

```json
"UserActivityObserver": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "UserActivityObserver",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": ["user_activity_context"],
  "cguid": 10004,
  "version": "0.1",
  "description": "Descriptor of UserActivityObserver Hyperty",
  "objectName": "UserActivityObserver",
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

Since the Hyperty supports the standard wallet data schema, any Catalog URL for that schema can be used.
