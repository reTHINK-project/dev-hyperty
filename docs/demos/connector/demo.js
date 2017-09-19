/*
 * This is the Hello World App demo that uses the Hello World Reporter and Observer Hyperties
 *
 */

//import {getTemplate, serialize} from './utils';

let RUNTIME;
const hypertyURI = (hyperty_domain, hyperty) => `hyperty-catalogue://catalogue.${hyperty_domain}/.well-known/hyperty/${hyperty}`;
let runtime_domain = 'hybroker.rethink.ptinovacao.pt';
let hyperty_domain = 'hybroker.rethink.ptinovacao.pt';
let demoTemplate = 'https://rawgit.com/reTHINK-project/dev-hyperty/master/examples/connector/Connector';

let config = {
  domain: hyperty_domain,
  development: false,
  runtimeURL: `hyperty-catalogue://catalogue.${runtime_domain}/.well-known/runtime/Runtime`
};

console.log('runtime config: ', config);

$(document).ready(function(){
    loadRuntime();
  });

/**
* Function to load the Runtime
*/

function loadRuntime()
{
  var start = new Date().getTime();
  //Rethink runtime is included in index.html
  rethink.default.install(config).then((runtime) => {
      RUNTIME = runtime
      loadHyperty()
    });
}

/**
* Function to load the HelloWorldObserver Hyperty
*/

function loadHyperty()
{
  RUNTIME.requireHyperty(hypertyURI(hyperty_domain, 'Connector')).then((hyperty) => {
    console.log('[ConnectorDemo.loadHyperty', hyperty);
    getTemplate(demoTemplate, 'demo.js').then(function(template) {
      let html = template();
      $('.main-content').find('.row').html(html);

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
