
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
  function afterUpdate(event) {
    console.log('DeviceManager new update', event);
  }
  result.instance.start(afterUpdate, identity);
}
