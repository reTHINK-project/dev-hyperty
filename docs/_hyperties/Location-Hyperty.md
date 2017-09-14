---
layout: hyperty
title:  "Location Hyperty"
description: "Provides Geolocation info of the User"
date:   2016-01-01
author: David Vilchez
categories:
- geolocation
img: whereami.jpg
thumb: whereami.jpg
tagged: geolocation
client: reTHINK Project
demo: https://rethink-project.github.io/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/Location
---

Location Hyperty
------------------

Location is an App Hyperty which provides the location of user. In this implementation the location is obtained from the [Geolocation API](https://dev.w3.org/geo/api/spec-source.html)exposed by the browser.
This hyperty has been developed as a App Hyperty. It means it is executed in the same sandbox as the main web application which uses it. However it is a candidate to become a Service Hyperty (executed in a independient web worker) in further phases of the project.

Note: currently this Hyperty is limited to the browser runtime but it can adapted to be usablein the browser runtime as it uses the Gelocation API exposed by the browser. However it can be adapted to be used in the Node.js and Standalone runtimes.

It uses the Context Data schema so it is compatible with any hyperty using the same data schema.

## API

### getCurrentPosition

Returns current position

#### Syntax

   `locationHy.getCurrentPosition()`

#### Returned value

Returns the [Position](https://developer.mozilla.org/en-US/docs/Web/API/Position) interface.

#### How to use it.

```javascript
   locationHyp.getCurrentPosition()
       .then((position)=>{
           console.log(position)
       })
```

### startPositionBroadcast

Notify every position change to subcribed hyperties

#### Syntax

   `locationHy.startPositionBroadcast(subscribers)`

#### Params

*subscribers*

List of hyperties urls. These hyperties will receive a [context](https://github.com/reTHINK-project/dev-service-framework/blob/master/schemas/json-schema/data-objects/Context.json) data object observer invitation.

#### How to use it.

   `locationHy.startPositionBroadcast(['<hyperty-runtime-url>', ...])`

## Framework improvement proposals derived from Hyperty Location development.

The same described by group-chat hyperty [here](../group-chat/readme.md)


Since the Hyperty supports the standard context data schema, any Catalog URL for that schema can be used.
