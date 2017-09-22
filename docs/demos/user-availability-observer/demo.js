/*
 * This is the Hello World App demo that uses the Hello World Reporter and Observer Hyperties
 *
 */

//import {getTemplate, serialize} from './utils';

let RUNTIME;
const hypertyURI = (hyperty_domain, hyperty) => `hyperty-catalogue://catalogue.${hyperty_domain}/.well-known/hyperty/${hyperty}`;
let runtime_domain = 'hybroker.rethink.ptinovacao.pt';
let hyperty_domain = 'hybroker.rethink.ptinovacao.pt';
let demoTemplate = 'https://rawgit.com/reTHINK-project/dev-hyperty/master/examples/user-availability/userAvailabilityObserver';
let demoJs = 'https://rawgit.com/reTHINK-project/dev-hyperty/master/examples/user-availability/UserAvailabilityObserverDemo.js';

let config = {
  domain: hyperty_domain,
  development: false,
  runtimeURL: `hyperty-catalogue://catalogue.${runtime_domain}/.well-known/runtime/Runtime`
};

$(window).on( "load", function() {
  console.log('ready');

  loadRuntime();
});

/**
* Function to load the Runtime
*/

function loadRuntime() {
  var start = new Date().getTime();
  //Rethink runtime is included in index.html
  rethink.default.install(config).then((runtime) => {
    RUNTIME = runtime
    loadHyperty()
  }).catch((reason) => {
    console.error(reason);
  });
}

/**
* Function to load the HelloWorldObserver Hyperty
*/

function loadHyperty()
{
  RUNTIME.requireHyperty(hypertyURI(hyperty_domain, 'UserAvailabilityObserver')).then((hyperty) => {
    console.log('[UserAvailabilityObserverDemo.loadHyperty', hyperty);

    getTemplate(demoTemplate, demoJs).then(function(template) {
      let html = template();
      $('.demo-content').html(html);

      templateAreReady('user-availability');

      if (typeof hypertyLoaded === 'function') {
        hypertyLoaded(hyperty);
      } else {
        let msg = 'If you need pass the hyperty to your template, create a function called hypertyLoaded';
        console.info(msg);
        notification(msg, 'warn');
      }

      loading = false;

    });
  });
}


/**
  * Call back after hyperty is loaded
  */
function hypertyDeployed(result) {
  let hypertyObserver;

  hypertyObserver = result.instance;

  console.log('[HelloWorldDemo.hypertyDeployed] ',hypertyObserver);

  $('.observer-info').append('<p>URL: ' + result.runtimeHypertyURL + '</p>');

  // Add an invitation Callback
  hypertyObserver.addEventListener('invitation', function(identity) {

    console.log('[HelloWorldDemo] Invitation received from:', JSON.stringify(identity));

    $('.observer-msg-panel').append('<p>Invitation Received from:' + identity.userProfile.username + '</p>');


  });


  hypertyObserver.addEventListener('hello', function(event) {

    console.log('[HelloWorldDemo] Hello received from:', event.hello);

    $('.observer-msg-panel').append('<p>' + event.hello + '</p>');

  });

  console.log('Observer Waiting for Hello!!');

}
