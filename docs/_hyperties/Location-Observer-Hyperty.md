---
layout: hyperty
title:  "Location Observer Hyperty"
description: "Observes Geolocation info from users"
date:   2016-01-01
author: David Vilchez
categories:
- geolocation
img: whereami.jpg
thumb: whereami.jpg
tagged: geolocation
client: reTHINK Project
demo: /demos/location-observer/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/Location
---


The Location Observer provides the monitoring of Location from multiple users. It enables the discovery of users publishing its Location through the Location Reporter and the option to subscribe to it.

This Hyperty handles a standard [Context Data Object](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/context) with:

**Hyperty Resource Type**

* LOCATION_CONTEXT

**ContextUnit**

-	lat
- lon

**example**

```json
{
 "scheme": "context",
 "id": "1276020076",
 "time": 1465070579,
 "values": [ {
  "type": "location_context",
  "unit": "lat",
  "value": 23.55052 },
  {
   "scheme": "context",
   "id": "1276020076",
   "time": 1465070579,
   "values": [ {
    "type": "location_context",
    "unit": "lon",
    "value": -46.633309 }]
}
```


## API

The Location Observer Hyperty provides an API to discover and observe multiple users publishing location info. The App has to set one listener per observed user to receive events about location change.

### start

This function starts location observation and returns one array of Location instances. For each one, the App has to set a onChange event handler (see below). If no users exist to observe, it returns `false`.

```javascript
<Promise> Context[] || boolean start()
```

**parameters**

No input parameter.

**returns**

A promise with an array of Context data objects.

### discoverUsers

This function discovers Hyperties used by users to publish Location info.

```javascript
<Promise> HypertyInstance[] discoverUsers( string email, string ?domain )
```

**parameters**

*email* the user identifier
*domain* (optional) the domain providing the Hyperty

**returns**

A promise with an array of discovered HypertyInstance.

### observe

This function starts the observation of the location managed by a certain Hyperty.

```javascript
<Promise> ContextDataObject observe( HypertyURL hypertyID )
```

**parameters**

*hyperty* the DiscoveredObject of the Hyperty to be observed

**returns**

A promise with the Location Data Object Observer for a certain user.

### unobserve

This function stops the observation of the location for a certain user.

```javascript
unobserve( ContextURL location )
```

**parameters**

*location* the Location Data Object Observer URL to be unobserved


### Monitor changes to Location info

Every change of the location triggers a `onChange` event of the observed Data:

```javascript
location.onChange('*', (event) => {
	console.log('New User location :', location.data.values);

});
```


### Descriptor

The Hyperty descriptor is:

```json
"LocationObserver": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "LocationObserver",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": ["location_context"],
  "cguid": 10004,
  "version": "0.1",
  "description": "Descriptor of LocationObserver Hyperty",
  "objectName": "LocationObserver",
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
