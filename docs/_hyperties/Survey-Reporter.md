---
layout: hyperty
title:  "Survey Reporter Hyperty"
description: "Manages User's surveys answers"
date:   2018-04-01
author: ?
categories:
- learning
img: survey.png
thumb: survey.png
tagged: elearning
client: Sharing Cities Project
demo: /demos/survey/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/Survey
---

The Survey Reporter Hyperty manages user's answers to Surveys or Exams.

This Hyperty reports a standard [Test Data Object](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/survey) with:

*to be completed*

**example**

```json
{
 "scheme": "wallet",
  "balance": 230 } ]
}
```


## API

The Wallet Hyperty provides an API to create and delete wallets, to monitor wallet balance and wallet transactions and to transfer tokens. This API should be compliant with [ERC20 API](https://theethereum.wiki/w/index.php/ERC20_Token_Standard)

### start

*to be completed*

```javascript
<Promise> Wallet start()
```

**parameters**

No input parameter.

**returns**

A promise with the Wallet DataObject.



### Descriptor

*to be updated*

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

Since the Hyperty supports the standard wallet data schema, any Catalog URL for that schema can be used.
