---
layout: hyperty
title:  "MyBracelet Hyperty"
description: "Monitors my Activity"
date:   2016-06-01
author: Luis Duarte
categories:
- iot
img: heart.jpg
thumb: heart.jpg
tagged: health
client: reTHINK Project
demo: https://rethink-project.github.io/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/MyBracelet
---


My Bracelet Hyperty
-------------------


The My Bracelet Hyperty main functionality is to collect data from an individual bracelet, publish it to a certain Context Resource URL.

This Hyperty handles a standard [Context Data Object](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/context) with:

**Hyperty Resource Type**

* HEART_RATE
* USER_STEPS
* SLEEP
* BATTERY


**ContextUnit**

-	beat/m: Heart rate in beats per minute
-	beats: Cumulative number of heart beats
-	steps/m: number of steps per minute
-	steps: Cumulative number of steps
- s: amount of sleep in seconds

**example**

```json
{
	"scheme": "context",
     "id": "1276020076",
     "time": 1465070579,
     "values": [
      {
				"type": "user_steps",
				"name": "Cumulative number of steps",
         "unit": "steps",
         "value": 340 },
			 {
 				"type": "battery",
				"name": "remaining battery energy level in percents",
        "unit": "%EL",
        "value": 0.8 }
     ]
}
```


## API

The Bracelet Hyperty an API to the Application to discover and connect to the bracelet. These functions are only required to be used once. By default, the Hyperty automatically connects and starts reading a bracelet that was connected the last time.

### discover

This function discovers available bracelets.

```javascript
<Promise> Context.Context[] discover()
```

**parameters**

No input parameter.

**returns**

A list of Context objects is returned as a Promise. Each Context object contains:

context.id : MAC Address of the device

context.name : name of the device eg "Mi Band"

context.description : additional information about the device (optional)

### connect

This function connects to a certain previously discovered bracelet and starts reading its sensors.

```javascript
<Promise> Context connect( string id, SensorOptions ?options )
```

**parameters**

*id* device identity returned by the discover function ie context.id

*options* is of type SensorOptions defined in [W3C Generic Sensor API](https://www.w3.org/TR/generic-sensor/#api) where measurement frequency is defined.

**returns**
Since the Hyperty supports the standard context data schema, any Catalog URL for that schema can be used.


## Descriptor

The My Bracelet Hyperty descriptor is:

```json
"Bracelet": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "HypertyBracelet",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": [
    "heart_rate", "sleep", "steps", "battery"
  ],
  "cguid": 10004,
  "version": "0.1",
  "description": "Descriptor of Bracelet Hyperty",
  "objectName": "HypertyBracelet",
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
