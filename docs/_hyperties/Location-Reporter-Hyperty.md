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

The Location Reporter is an Hyperty which provides the location of the user. In this implementation the location is obtained from the [Geolocation API](https://dev.w3.org/geo/api/spec-source.html) exposed by the browser.

For simplification purposes, subscription requests from the Location Observer Hyperty are automatically accepted. But for production, the subscription request should be accepted by the user.

It uses the Context Data schema so it is compatible with any hyperty using the same data schema.


## API

### watchMyLocation

Setup watch to receive updates anytime user's location is changed but without broadcasting it to observers.

#### Syntax

   `locationHy.watchMyLocation(callback)`

#### How to use it.

```javascript
   locationHyp.watchMyLocation(
       (position)=>{
           console.log(position)
       });
```

### removeWatchMyLocation

Removes watch of MyLocation

#### Syntax

   `locationHy.removeWatchMyLocation()`

#### How to use it.

```javascript
   locationHyp.removeWatchMyLocation();
```

### getLocation

Returns current position without broadcasting it to observers.

#### Syntax

   `Context locationHy.getLocation()`

Returns the [ContextLocation Data Object](https://rethink-project.github.io/specs/datamodel/data-objects/context/readme/).

#### How to use it.

```javascript
   myLocation = locationHyp.getLocation()
```

### updateLocation

Returns and broadcasts my current position

#### Syntax

   `<Promise> Context locationHy.updateLocation()`

Returns as a promise the [ContextLocation Data Object](https://rethink-project.github.io/specs/datamodel/data-objects/context/readme/).

#### How to use it.

```javascript
   locationHyp.updateLocation()
       .then((position)=>{
           console.log(position)
       })
```

### retrieveSpots

Returns spots to be displayed locally or where the user can checkin.

#### Syntax

   `<Promise> Spots locationHy.retrieveSpots(spotsUrl)`


#### Params

   *spotsUrl*

Data Object URL where Location Spots are published.

#### How to use it.

```javascript
   locationHyp.retrieveSpots(spotsUrl)
       .then((spots)=>{
           console.log(spots)
       })
```

### checkin(id)

Performs checkin into a spot

#### Syntax

   `<Promise> boolean locationHy.checkin(spotsI)`


#### Params

   *spotsId*

Spots Location Id where user is trying to perform checkin.

#### How to use it.

```javascript
   locationHyp.checkin(spotsId)
       .then((result)=>{
           console.log(result)
       })
```

### startPositionBroadcast

Notify every position change to subscribed hyperties ie observers.

#### Syntax

   `locationHy.startPositionBroadcast(subscribers)`

#### Params

*subscribers*

List of hyperties urls. These hyperties will receive a [context](../../specs/datamodel/data-objects/context/) data object observer invitation.

#### How to use it.

   `locationHy.startPositionBroadcast(['<hyperty-runtime-url>', ...])`
