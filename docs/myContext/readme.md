
My Context Hyperty
-------------------

##1. Functionality description

The My Context Hyperty main functionality is to collect and aggregate data collected from different Context sources, apply some algorithm to turn the data more meaningful and publish it to a certain Context Resource URL allocated by the Hyperty Runtime.

##1.1 Hyperty Data Objects schemas

This Hyperty handles a standard [Context Data Object](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/context) with:

**Hyperty Resource Type**

* HEART_RATE
* USER_STEPS
* SLEEP
* AVAILABILITY
* USER_ACTIVITY
* USER_COMMUNICATION
* LOCATION


**ContextUnit**

-	beat/m: Heart rate in beats per minute
-	beats: Cumulative number of heart beats
-	steps/m: number of steps per minute
-	steps: Cumulative number of steps
- s: amount of sleep in seconds


**example**

```
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
 				"type": "USER_ACTIVITY",
				"name": "Rethink design task",
        "unit": "second",
        "value": 1745 }
     ]
}
```

##1.2 Descriptor

The My Context Hyperty descriptor is:

```
"MyContext": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "HypertyMyContext",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": [
    "heart_rate", "sleep", "steps", "location", "user_activity"
  ],
  "cguid": 10004,
  "version": "0.1",
  "description": "Descriptor of My Context Hyperty",
  "objectName": "HypertyMyContext",
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

##2. Exposed API

The My Context Hyperty exposes an API to the Application to discover and connect to different Context producers hyperties. These functions are only required to be used once. By default, the Hyperty automatically connects and starts processing context data published by context producers that were connected the last time.

### discover

This function discovers available context producers.

```
<Promise> Context.Context[] discover()
```

**parameters**

No input parameter.

**returns**

A list of Context objects is returned as a Promise. Each Context object contains:

context.name : name of the context data eg "Mi Band"

context.description : additional information about the context source (optional)

### subscribe

This function requests to subscribe to a certain previously discovered context producer and if successful receives the last context data produced.

```
<Promise> Context promise( URL.ContextURL url )
```

**parameters**

*url* ContextURL returned by the discover function


**returns**

It returns the Context Data Object created by the Syncher allowing the Application to also observe the bracelet with `context.onChange().then(function(){})`.
