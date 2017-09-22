/*
 * This is the Hello World App demo that uses the Hello World Reporter and Observer Hyperties
 *
 */

let RUNTIME;
let hypertyObserver = null;
let hypertyReporter = null;
const hypertyURI = (hyperty_domain, hyperty) => `hyperty-catalogue://catalogue.${hyperty_domain}/.well-known/hyperty/${hyperty}`;
let runtime_domain = 'hybroker.rethink.ptinovacao.pt';
let hyperty_domain = 'hybroker.rethink.ptinovacao.pt';

let config = {
  domain: hyperty_domain,
  development: false,
  runtimeURL: `hyperty-catalogue://catalogue.${runtime_domain}/.well-known/runtime/Runtime`
};

console.log('runtime config: ', config);

$(window).on( "load", function() {
  console.log('ready');

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
      loadHypertyObs()
    });
}

/**
* Function to load the HelloWorldObserver Hyperty
*/

function loadHypertyObs()
{
  RUNTIME.requireHyperty(hypertyURI(hyperty_domain, 'HelloWorldObserver')).then((hyperty) => {
    console.log('[HelloWorldDemo.loadHypertyObs', hyperty);
    hypertyObserver = hyperty;
    $('.observer-info').append('<p>Deployed</p>');
    hypertyDeployed(hypertyObserver);
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
