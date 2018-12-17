/* jshint undef: true */

//import {Syncher} from 'service-framework/dist/Syncher';
//import {divideURL} from '../utils/utils';
import hello from './hello';

const hypertyDescriptor = {
  "name": "HelloWorldReporter",
  "language": "javascript",
  "signature": "",
  "configuration": {
  },
  "constraints": {
    "browser": true
  },
  "hypertyType": [
    "hello"
  ],
  "dataObjects": [
    "https://%domain%/.well-known/dataschema/HelloWorldDataSchema"
  ]
};
/**
* Hyperty Connector;
* @author Paulo Chainho [paulo-g-chainho@telecom.pt]
* @version 0.1.0
*/
class HelloWorldReporter {

  /**
  * Create a new HelloWorldReporter
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */

  constructor() {

 }

  _start(hypertyURL, bus, configuration, factory) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');
    if (!factory) throw new Error('The factory is a needed parameter');

    let _this = this;

    let domain = factory.divideURL(hypertyURL).domain;
    _this._domain = domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/HelloWorldDataSchema';
    _this._factory = factory;
    _this._backup = configuration.hasOwnProperty('backup') ? configuration.backup : false;

    console.log('HelloWorldReporter configuration', configuration);

    let syncher = _this._factory.createSyncher(hypertyURL, bus, configuration);

    _this._syncher = syncher;

    _this._runtimeHypertyURL = hypertyURL;

    /*_this._syncher.resumeReporters({}).then((resumeReporters) => {

      if (!resumeReporters) return;

      // lets now observe any changes done in Hello World Object
      console.log('[hyperty syncher resume] - dataObject', resumeReporters);

      Object.values(resumeReporters).forEach((helloObjtReporter) => {
        _this.helloObjtReporter = helloObjtReporter;

        this.prepareDataObjectReporter(helloObjtReporter);

        helloObjtReporter.data.hello = 'REPORTER RESUMED';

        console.log(this._onReporterResume);
        if (this._onReporterResume) this._onReporterResume(helloObjtReporter);
      })

    });*/

  }

  get descriptor() {
    return hypertyDescriptor;
  }

  get name() {
    return hypertyDescriptor.name;
  }

  get runtimeHypertyURL(){
    return this._runtimeHypertyURL;
  }

  /**
  * Create HelloWorld Data Object
  * @param  {HypertyURL} HypertyURL - Invited
  */

  hello(hypertyURL) {
    let _this = this;
    let syncher = _this._syncher;

    return new Promise(function(resolve, reject) {

      let input = Object.assign({resources: ['hello']}, {});
      input.backup = _this._backup;
      input.reuseURL = true;
      input.mutual = false;
      input.domain_registration = false;

      syncher.create(_this._objectDescURL, [hypertyURL], hello, true, false, 'hello', {}, input).then(function(helloObjtReporter) {
        console.info('1. Return Created Hello World Data Object Reporter', helloObjtReporter);

        _this.helloObjtReporter = helloObjtReporter;

        _this.prepareDataObjectReporter(helloObjtReporter);

        resolve(helloObjtReporter);

      })
      .catch(function(reason) {
        console.error(reason);
        reject(reason);
      });

    });
  }

  prepareDataObjectReporter(helloObjtReporter) {

    helloObjtReporter.onSubscription(function(event) {
      console.info('-------- Hello World Reporter received subscription request --------- \n');

      // All subscription requested are accepted

      event.accept();
    });

    helloObjtReporter.onRead((event) => {
      event.accept();
    });

  }

  /**
  * Update HelloWorld Data Object
  *
  */

  bye(byeMsg) {
    let _this = this;

    console.log('bye:', _this.helloObjtReporter );

    if (byeMsg)
      _this.helloObjtReporter.data.hello = byeMsg;
    else {
      _this.helloObjtReporter.data.hello = "bye, bye";
      }
  }

  onReporterResume(callback) {
    this._onReporterResume = callback;
  }


}

export default HelloWorldReporter;

