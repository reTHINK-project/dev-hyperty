---
layout: hyperty
title:  "Location Reporter Hyperty"
description: "Provides Geolocation info about users"
date:   2016-01-01
author: David Vilchez
categories:
- geolocation
img: location-reporter.png
thumb: location-reporter.png
tagged: geolocation
client: reTHINK Project
demo: /demos/location-reporter/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/LocationReporter
---


The Location Reporter is an Hyperty which provides the location of the user. In this implementation the location is obtained from the [Geolocation API](https://dev.w3.org/geo/api/spec-source.html)exposed by the browser.

For simplification purposes, subscription requests from the Location Observer Hyperty are automatically accepted. But for production, the subscription request should be accepted by the user.

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

Notify every position change to subscribed hyperties

#### Syntax

   `locationHy.startPositionBroadcast(subscribers)`

#### Params

*subscribers*

List of hyperties urls. These hyperties will receive a [context](../../specs/datamodel/data-objects/context/) data object observer invitation.

#### How to use it.

   `locationHy.startPositionBroadcast(['<hyperty-runtime-url>', ...])`
