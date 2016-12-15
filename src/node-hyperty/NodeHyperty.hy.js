/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';

export function divideURL(url) {

  // let re = /([a-zA-Z-]*)?:\/\/(?:\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/gi;
  let re = /([a-zA-Z-]*):\/\/(?:\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256})([-a-zA-Z0-9@:%._\+~#=\/]*)/gi;
  let subst = '$1,$2,$3';
  let parts = url.replace(re, subst).split(',');

  // If the url has no protocol, the default protocol set is https
  if (parts[0] === url) {
    parts[0] = 'https';
    parts[1] = url;
  }

  let result = {
    type: parts[0],
    domain: parts[1],
    identity: parts[2]
  };

  return result;

}

/**
* Hyperty Connector;
* @author Paulo Chainho [paulo-g-chainho@telecom.pt]
* @version 0.1.0
*/
class NodeHyperty {

  /**
  * Create a new HelloWorldReporter
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */
  constructor(hypertyURL, bus, configuration) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let domain = divideURL(hypertyURL).domain;
    this._domain = domain;
    this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/HelloWorldDataSchema';

    let syncher = new Syncher(hypertyURL, bus, configuration);
    this.syncher = syncher;

    syncher.create(this._objectDescURL, [], {}).then((helloObjtReporter) => {
      console.info('1. Return Created Hello World Data Object Reporter', helloObjtReporter);
    }).catch((error) => {
      console.log('Error: ', error);
    });

    // syncher.onNotification((event) => {
    //   this._onNotification(event);
    // });

  }

  // _onNotification(event) {
  //
  //     let _this = this;
  //
  //     console.info( 'Event Received: ', event);
  //
  //     // Acknowledge reporter about the Invitation was received
  //     event.ack();
  //
  //     // Subscribe Hello World Object
  //     this.syncher.subscribe(_this._objectDescURL, event.url).then(function(helloObjtObserver) {
  //       // Hello World Object was subscribed
  //       console.info( helloObjtObserver);
  //       helloObjtObserver.onChange('*', function(event) {
  //         // Hello World Object was changed
  //         console.info('message received:', event);
  //       });
  //
  //     }).catch(function(reason) {
  //       console.error(reason);
  //     });
  //   }

}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'NodeHyperty',
    instance: new NodeHyperty(hypertyURL, bus, configuration)
  };

}
