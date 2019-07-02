This Repo has been merged with [dev-protostubs](https://github.com/reTHINK-project/dev-protostubs)

Hyperty Repository
-------------------------

This repository hosts source code of Hyperties. For more information about Hyperties and reTHINK framework pls read [this](https://github.com/reTHINK-project/dev-hyperty-toolkit/blob/master/README.md).

### The Repository structure

#### **src** folder

Hold all Hyperty related source code, like hyperty classes and JSON-Schemas. The hyperty class must have the suffix ".hy.js", on the file.

**Example:** Hello.hy.js

**Why?**
Because all the files in folder, could be a possible hyperty, with this suffix, we can distinguish the main hyperty from others files that complement it;

To expose your hyperty in the Testing Web App you need to go to *function* ***hypertyDeployed*** on **main.js** and add your **hyperty name** and **javascript file** file to the switch cases presented there.

**example:**

```javascript

function hypertyDeployed(hyperty) {

  ...
  switch (hyperty.name) {

    // You can add your own hyperty with this code
    case '<hyperty name>':
      template = '<hyperty-name>/<HypertyName>';
      script =  '<hyperty-name>/<app.js>';
      break;
  }
}
```
**NOTE:** This probably needs to be optimized, suggestion are welcome;

## Install all modules inside each hyperty source code

```shell
# This will execute npm install for each package.json inside each hyperty source code;
npm run install:all
```

## The Repository structure

This repository hosts source code of Hyperties. For more information about Hyperties and reTHINK framework pls read [this](https://github.com/reTHINK-project/dev-hyperty-toolkit/blob/master/README.md).

### **SRC** folder

Hold all Hyperty related source code, like hyperty classes and JSON-Schemas. The hyperty class must have the suffix ".hy.js", on the file.

Each hyperty folder could have it's own `package.json`

```shell
# To create the pacakge.json
npm init
```

To use the all modules from [**Service Framework**](https://github.com/reTHINK-project/dev-service-framework/), like, *Syncher* or *Discovery* do:
```shell
# install dependencies
npm install rethink-project/dev-service-framework#develop --save
```

**Example:** Hello.hy.js

**Why?**
Because all the files in folder, could be a possible hyperty, with this suffix, we can distinguish the main hyperty from others files that complement it;


#### Hyperty Source Code

```javascript

// Service Framework
import IdentityManager from 'service-framework/dist/IdentityManager';
import {Discovery} from 'service-framework/dist/Discovery';
import { Syncher } from 'service-framework/dist/Syncher';

/**
 *
 */
class MyHyperty {

  constructor(hypertyURL, bus, configuration) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let syncher = new Syncher(hypertyURL, bus, configuration);

  }

  myMethod() {
    console.log('hello');
  }

}

/**
 * Function will activate the hyperty on the runtime
 * @param  {URL.URL} hypertyURL   url which identifies the hyperty
 * @param  {MiniBus} bus          Minibus used to make the communication between hyperty and runtime;
 * @param  {object} configuration configuration
 */
export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'MyHyperty',
    instance: new MyHyperty(hypertyURL, bus, configuration)
  };

}
```

#### Hyperty Descriptor

```json
{
  "language": "javascript",
  "signature": "",
  "configuration": {},
  "hypertyType": [
    "chat"
  ],
  "constraints": {
    "browser": true
  },
  "dataObjects": [
    "https://catalogue.%domain%/.well-known/dataschema/Communication"
  ],
  "objectName": "HypertyName"
}
```


### **EXAMPLES** folder

In this folder you have, for each hyperty you develop, the Web side testing.
This is customized with HTML using [Handlebars](http://handlebarsjs.com/) and ES5 javascript;

With this template system you can:

 - avoid the initial html setup, like **&lt;html&gt;, &lt;head&gt;, &lt;body&gt;**, and add only the html tags you need, like **&lt;div&gt;, &lt;p&gt;, &lt;b&gt;** and others.
 - use some extra features like, **variables, {{each}}, {{if}}**, look at [documentation](http://handlebarsjs.com/expressions.html)
 -

**Examples:**
 - hello-world > helloWorld.hbs
 - hyperty-chat > HypertyChat.hbs
 - hyperty-connector > HypertyConnector.hbs

#### **Test** folder

 You can make your own tests to an hyperty, only need create an file with your hyperty name, and suffix the ".spec.js"

 **Example:** Hello.spec.js
