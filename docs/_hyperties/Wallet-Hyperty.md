---
layout: hyperty
title:  "Wallet Hypertt"
description: "Manages User's Tokens Wallet"
date:   2017-02-01
author: ?
categories:
- cryptocurrency
img: wallet.png
thumb: wallet.png
tagged: cryptocurrency
client: Sharing Cities Project
demo: /demos/wallet/
catalogue: https://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/hyperty/Wallet
---

The Wallet Hyperty manages a user's cryptocurrency wallet.

This Hyperty observes a standard [Wallet Data Object](https://github.com/reTHINK-project/dev-service-framework/tree/master/docs/datamodel/data-objects/wallet) with:


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
