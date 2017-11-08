---
layout: hyperty
title:  "Hello World Reporter"
description: "Simple Hello World Hyperty Reporter examples"
date:   2015-06-01
author: Paulo Chainho
categories:
- hello-world
img: hello-world-reporter.png
thumb: hello-world-reporter.png
tagged: hello-world
client: reTHINK Project
demo: /demos/hello-world-reporter/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/HelloWorldReporter
---

The Hello World Reporter is a very simple Hyperty to illustrate how Reporter Hyperties work. It works together with Hello World Observer Hyperty. It invites HelloWorldObserver hyperties by using its HypertyURL and publish changes made on the 'hello' Data Object.

This Hyperty handles a simple hello Data Object containing a single string hello property:

```json
{
	"$schema": "http://json-schema.org/draft-04/schema#",
	"id": "HelloObject",
	"type": "object",
	"required": ["hello"],
  "properties": {
		"scheme": {
			"constant": "hello"
		},
		"hello": {
			"type": "string"
		}
	}
}
```

## API

The HelloWorldReporter only provides two simple functions: `hello` and `bye`.

### hello

The hello function creates a new instance of 'hello' DataObjectReporter with initial data value "Hello Buddy!!", and invites an HelloWorldObserver Hyperty to observe the 'hello' data object. The subscription request is automatically accepted and the response contains the initital data value of the 'hello' Data Object.


```javascript
<Promise> DataObjectReporter hello(HypertyURL hyperty) )
```

**parameters**

`hyperty`  the HypertyURL address of the HelloWorldObserver Hyperty to be invited.

**returns**

The created `hello` DataObjectReporter.

**How to use it**

```javascript
hyperty.instance.hello(hyperty).then(function(hello){
	console.log('Invitation sent with hello: ', hello.data);
});
```

### bye

This function changes the 'hello' object with an optional bye message string.

```javascript
bye(string ?message)
```

**parameters**

`message`  an optionl string message that is used to change the 'hello' Data Object. If not used, a default 'bye bye!!' string is used to change the Data Object.


**How to use it**

```javascript
hyperty.instance.bye(message);
```


### Descriptor

The Hyperty descriptor is:

```json
"HelloWorldObserver": {
  "sourcePackage": {
    "sourceCode": ""
    "sourceCodeClassname": "HelloWorldObserver",
    "encoding": "base64",
    "signature": ""
  },
  "hypertyType": ["hello"],
  "cguid": 10004,
  "version": "0.1",
  "description": "Descriptor of HelloWorldObserver Hyperty",
  "objectName": "HelloWorldObserver",
  "configuration": {},
  "sourcePackageURL": "/sourcePackage",
  "language": "javascript",
  "signature": "",
  "messageSchemas": "",
  "dataObjects": [
    "https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/dataschema/HelloWorldDataSchema"
  ],
  "accessControlPolicy": "somePolicy"
}
```
