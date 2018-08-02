
function hypertyLoaded(result, runtimeLoader = null) {

  console.log('DeviceManager hyperty loaded', result.instance);
  if (runtimeLoader != null) {
    runtimeLoader.requireProtostub('sharing-cities-dsm');
  }

  result.instance.identityManager.discoverUserRegistered().then(function(identity) {
    hypertyReady(result, identity);
  });


}

function hypertyReady(result, identity) {

  console.log('DeviceManager hyperty Ready', result, identity);
  result.instance.start(identity);
}
