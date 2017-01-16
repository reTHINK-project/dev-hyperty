/* jshint undef: true */

import os from 'os';
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

function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};


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
    this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/Connection';

    this._interval;

    let syncher = new Syncher(hypertyURL, bus, configuration);
    this.syncher = syncher;

    let mbTotal = bytesToSize(os.totalmem());
    let mbFree = bytesToSize(os.freemem());

    let initialData = {
      name: 'Node Hyperty',
      description: 'Should send information related with operating system',
      time: new Date().toISOString(),
      os: {
        arch: os.arch(),
        image: 'https://placekitten.com/g/200/300',
        plataform: os.platform(),
        totalMemory: mbTotal,
        freeMemory: mbFree,
        hostname: os.hostname()
      }
    };

    syncher.onNotification((event) => {

      console.log('Notification:', event);

      if (event.type === 'delete') {
        console.log('Delete: ', event);
        clearInterval(this._interval);
      }

    });

    syncher.create(this._objectDescURL, [], initialData).then((helloObjtReporter) => {
      console.info('1. Return Created Node Hyperty Data Object Reporter', helloObjtReporter);

      helloObjtReporter.onSubscription((event) => {
        event.accept();
      });

      this.generateData(helloObjtReporter);

    }).catch((error) => {
      console.log('Error: ', error);
    });
  }

  generateData(dataObjectReporter) {

    this._interval = setInterval(() => {

      dataObjectReporter.data.time = new Date().toISOString();
      console.log('UPDATE DATA:', dataObjectReporter.data);

    }, 1000);

  };

}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'NodeHyperty',
    instance: new NodeHyperty(hypertyURL, bus, configuration)
  };

}
