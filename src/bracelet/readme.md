
My Bracelet Hyperty
-------------------

##1. Functionality description

The My Bracelet Hyperty main functionality is to collect data from an individual bracelet, publish it to a certain Context Resource URL allocated by the Hyperty Runtime.

##1.1 Hyperty Data Objects schemas

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
 				"type": "battery",
				"name": "remaining battery energy level in percents",
        "unit": "%EL",
        "value": 0.8 }
     ]
}
```

##1.2 Descriptor

The My Bracelet Hyperty descriptor is:

```
"Bracelet": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "HypertyBracelet",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": [
    "heart_rate". "sleep", "steps", "battery"
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

##2. Exposed API

The Bracelet Hyperty does not expose any API to the Application.
