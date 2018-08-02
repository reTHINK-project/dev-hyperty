---
layout: hyperty
title:  "Elearning Player Hyperty"
description: "Plays Elearning content and Manages User's answers"
date:   2018-04-01
author: ?
categories:
- learning
img: elearning.png
thumb: elearning.png
tagged: elearning
client: Sharing Cities Project
demo: /demos/elearning-player/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/elearning-player
---

The E-learning Player Hyperty plays Elearning Content and manages user's answers.

This Hyperty reports a standard [ElearningAnswer Data Object](https://rethink-project.github.io/specs/datamodel/data-objects/elearning/readme/) with:


**example**

```json
{
id: "myid",
date: "2018-05-24",
answers: [2,2]
}
```


## API

The Elearning Player Hyperty provides an API to read elearning content and to submit elearning answers.

### read

```javascript
<Promise> Elearning[] read(URL elearningReporterUrl)
```

**parameters**

`elearningServerUrl` the Data Object URL of the Elearning Data Object Reporter that manages the E-learning content.

**returns**

A promise with an array of Elearning DataObjects.

### answer

```javascript
<Promise> answer(ElearningAnswer answer )
```

**parameters**

`answer` the JSON Object containing the answer to an E-learning content that will be published by the Hyperty.

**returns**

A promise that is resolved when the answer is sucessfuly reported.

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

Since the Hyperty supports the standard ElearningAnswer data schema, any Catalog URL for that schema can be used.
