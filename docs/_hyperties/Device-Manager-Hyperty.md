---
layout: hyperty
title:  "Device Manager Hyperty"
description: "Manages IoT Devices and Observes data captured from its sensors"
date:   2018-04-01
author: ?
categories:
- iot
img: device.jpg
thumb: device.jpg
tagged: iot
client: Sharing Cities Project
demo: /demos/device-observer/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/Device
---


The Device Manager is able to manage IoT devices with its sensors / actuators (eg create, remove). It also allows to monitor data collected from these devices.

This Hyperty handles a standard [Device Data Object](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/device) with:


**example**

*to be updated*

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

## Configuration

The Device Manager configuration comprises:

```
  deviceManager: <wallet manager server address>
```

## API

The Device Manager Hyperty provides an API to create and remove devices, as well as to create and remove endpoints associated to it.


### createDevice

This function creates one device. 

```javascript
<Promise> createDevice()
```

**parameters**

No input parameter.

**returns**

A promise with the new created Device data object.

#### Implementation notes

A execute type message is sent torwards `<wallet manager server address>` set in the configuration, having in the body `createDevice` function name.

### removeDevice

This function removes one device. 

```javascript
boolean removeDevice(string deviceId)
```

**parameters**

*deviceId* - the id of the device to be removed.

**returns**

A boolean is returned where true is for a successfull remove and false for a failed remove.

#### Implementation notes

A execute type message is sent torwards `<wallet manager server address>` set in the configuration, having in the body `removeDevice` function name and associated parameter.

### createEndpoint

This function creates one endpoint at one device. 

```javascript
<Promise> createEndpoint(string deviceId, string type, string name, string ?extId)
```

**parameters**

*deviceId* - the id of the device where the endpoint is created.

*type* - endpoint type ie "sensor" or "actuator".

*name* - name to be given to the endpoint.

*extId* - (optional) to be used in case this is a virtual endpoint and data is coming from a separated device or plataform.

**returns**

A promise with the new created Endpoint  object.

#### Implementation notes

A execute type message is sent torwards `<wallet manager server address>` set in the configuration, having in the body `createEndpoint` function name with associated parameters.

### removeEndpoint

This function removes one endpoint from the device. 

```javascript
boolean removeEndpoint(string name)
```

**parameters**

*name* - the id of the Endpoint to be removed.

**returns**

A boolean is returned where true is for a successfull remove and false for a failed remove.

#### Implementation notes

A execute type message is sent torwards `<wallet manager server address>` set in the configuration, having in the body `removeEndpoint` function name and associated parameter.



### Descriptor

*to be updated*

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
