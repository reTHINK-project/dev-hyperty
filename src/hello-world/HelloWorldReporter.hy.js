/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../utils/utils';
import hello from './hello';

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
  constructor(hypertyURL, bus, configuration) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');


    let _this = this;

    let domain = divideURL(hypertyURL).domain;
    _this._domain = domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/HelloWorldDataSchema';

    let syncher = new Syncher(hypertyURL, bus, configuration);

    _this._syncher = syncher;

    _this._syncher.resumeReporters({}).then((resumeReporters) => {

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

    });

  }

  /**
  * Create HelloWorld Data Object
  * @param  {HypertyURL} HypertyURL - Invited
  */

  hello(hypertyURL) {
    let _this = this;
    let syncher = _this._syncher;

    return new Promise(function(resolve, reject) {

      syncher.create(_this._objectDescURL, [hypertyURL], hello, false, false).then(function(helloObjtReporter) {
        console.info('1. Return Created Hello World Data Object Reporter', helloObjtReporter);

        _this.helloObjtReporter = helloObjtReporter;

        this.prepareDataObjectReporter(helloObjtReporter);

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



export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'HelloWorldReporter',
    instance: new HelloWorldReporter(hypertyURL, bus, configuration)
  };

}
