
function hypertyLoaded(result, runtimeLoader = null) {

  console.log('Wallet hyperty loaded', result.instance);
  if (runtimeLoader != null) {
    runtimeLoader.requireProtostub('sharing-cities-dsm');
  }

  result.instance.identityManager.discoverUserRegistered().then(function(identity) {
    hypertyReady(result, identity);
  });


}

function hypertyReady(result, identity) {
  /*
  console.log('Wallet hyperty Ready', result, identity);

  function afterUpdate(event) {
    console.log('WAllet new update', event);
    if (event.field == 'balance') {
      $('.token-value').text(event.data);

    }
  }

  const profileInfo = { ageRange: '18-25', workplace: 'Lisbon', cause: '0' };
  identity.profile = profileInfo;
  result.instance.start(afterUpdate, identity);
  */

  // get public wallets
  console.log('Wallet hyperty Ready', result, identity);

  function afterUpdate(event) {
    console.log('WAllet new update', event);
    if (event.field == 'balance') {
      $('.token-value').text(event.data);

    }
  }

  identity = {
    profile: {
      guid: 'user-guid://public-wallets'
    }
  };

  result.instance.start(afterUpdate, identity);
}
