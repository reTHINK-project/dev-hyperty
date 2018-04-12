
function hypertyLoaded(result, runtimeLoader) {

    console.log("Wallet hyperty loaded", result.instance, runtimeLoader);
    runtimeLoader.requireProtostub('sharing-cities-dsm');

    result.instance.identityManager.discoverUserRegistered().then(function(identity) {
      hypertyReady(result, identity);
    });


}

function hypertyReady(result, identity) {
  console.log("Wallet hyperty Ready", result, identity);

  function afterUpdate(event){
      console.log('WAllet new update', event);
      $('.token-value').text(event);
  }
  result.instance.start(afterUpdate, identity);
}
