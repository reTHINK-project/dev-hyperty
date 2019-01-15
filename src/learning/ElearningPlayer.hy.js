//import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
import { hypertyDescriptor } from './HypertyDescriptor';
//import Search from '../utils/Search';
//import IdentityManager from 'service-framework/dist/IdentityManager';
//import { Discovery } from 'service-framework/dist/Discovery';
//import { callbackify } from 'util';

class ElearningPlayer {


  constructor() {}
  get name(){
    return hypertyDescriptor.name;
  }

  get descriptor() {
    return hypertyDescriptor;
  }

  get runtimeHypertyURL(){
    return this.hypertyURL;
  }

 _start(hypertyURL, bus, config, factory) {
      let uri = new URI(hypertyURL);
    this.objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`;
    this.syncher = factory.createSyncher(hypertyURL, bus, config);
    this.identityManager = factory.createIdentityManager(hypertyURL, config.runtimeURL, bus);
    this.discovery = factory.createDiscovery(hypertyURL, config.runtimeURL, bus);
    this.search = factory.createSearch(this.discovery, this.identityManager);
    this.currentPosition = null;
    this.identity = null;
    this.bus = bus;
    this.hypertyURL = hypertyURL;
    this.reporter = null;
    this.watchID = null;


  }


  _getRegisteredUser() {
    let _this = this;

    return new Promise((resolve, reject) => {
      _this.identityManager.discoverUserRegistered().then((identity) => {
        console.log('[ElearningPlayer] GET MY IDENTITY:', identity);
        resolve(identity);
      }).catch((error) => {
        console.error('[ElearningPlayer] ERROR:', error);
        reject(error);
      });
    });

  }

  _resumeReporters() {
    let _this = this;

    //debugger;
    return new Promise((resolve, reject) => {
      _this.syncher.resumeReporters({ store: true }).then((reporters) => {
        console.log('[ElearningPlayer] Reporters resumed', reporters);

        let reportersList = Object.keys(reporters);

        if (reportersList.length > 0) {

          _this._getRegisteredUser().then((identity) => {

            reportersList.forEach((dataObjectReporterURL) => {
              //debugger;
              console.log(identity);
              _this.identity = identity;
              console.log('[ElearningPlayer] ', dataObjectReporterURL);
              console.log('[ElearningPlayer]', reporters[dataObjectReporterURL]);

              if (identity.userURL == reporters[dataObjectReporterURL].metadata.subscriberUsers[0] && reporters[dataObjectReporterURL].metadata.name == 'elearning') {
                //debugger;
                _this.reporter = reporters[dataObjectReporterURL];
                _this.reporter.onSubscription((event) => event.accept());
                return resolve(true);
              }
            });
            return resolve(false);
          });
        } else {
          return resolve(false);
        }
      }).catch((reason) => {
        console.info('[ElearningPlayer] Reporters:', reason);
      });
    });
  }

  //FOR invite elearning  -> hyperty://sharing-cities-dsm/elearning
  invite(observer) {

    let _this = this;

    return new Promise((resolve) => {

/*      function keepTrying() {
        _this.reporter.invitations = [];
        _this.reporter.inviteObservers([observer]);

        let promises = _this.reporter.invitations;

        Promise.all(promises).then(result => {
          resolve();
        }).catch(e => {
          setTimeout(function() {
            keepTrying();
          }, 100);
        });
      }*/

      if (_this.reporter) {
        console.log('[ElearningPlayer.invite] reporter ', _this.reporter)
        _this.reporter.inviteObservers([observer])
           console.info('[ElearningPlayer] invited: ', observer);

          resolve();

      } else {
        reject('[ElearningPlayer.invite] Reporter not created yet');
      }
    });

  }


  initQuizSubmission() {
    let _this = this;

    return new Promise((resolve) => {

      _this._resumeReporters().then((result) => {

      console.log('[ElearningPlayer] resume ', result);

      if (!result) {
        let input = { 
          resources: ['learning-context'], 
          "domain_registration": false,
           "domain_routing": false 
          };

        _this.syncher.create(_this.objectDescURL, [], {}, true, false, 'elearning', {}, input)
          .then((reporter) => {
            _this.reporter = reporter;
            console.log('[ElearningPlayer]  DataObjectReporter', _this.reporter);
            reporter.onSubscription((event) => event.accept());
            _this.search.myIdentity().then(identity => {
              _this.identity = identity;
            });
            resolve(true);
          });
      } else {
        resolve(true);
      }
    });
  });
}


  answer(id, answers) {
    let _this = this;
    let date = new Date();
    _this.reporter.data.values = [
      { id: id, date: date, answers: answers }
    ];

  }

  // can call with 'data://sharing-cities-dsm/elearning'
  retrieveQuizzes(quizzesURL) {

    return new Promise((resolve) => {
      let _this = this;

      let createMessage = {
        type: 'forward', to: quizzesURL, from: _this.hypertyURL,
        body: {
          from: _this.hypertyURL,
          type: 'read'
        }
      };
      console.log('elearning-player-retrieveQuizzes()', createMessage);

      _this.bus.postMessage(createMessage, (reply) => {
        resolve(reply);
        console.log('elearning-player-retrieveQuizzes() reply: ', reply);
      });

    });

  }

}

export default ElearningPlayer;
