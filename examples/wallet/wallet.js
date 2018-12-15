
function hypertyLoaded(result, runtimeLoader = null) {

  console.log('Wallet hyperty loaded', result);
  if (runtimeLoader != null) {
    runtimeLoader.requireProtostub('sharing-cities-dsm');
  }

  result.identityManager.discoverUserRegistered().then(function (identity) {
    hypertyReady(result, identity);
  });


}

function hypertyReady(result, identity) {

  console.log('Wallet hyperty Ready', result, identity);

  function afterUpdate(event) {
    console.log('Wallet new update', event);
    if (event.field == 'balance') {
      $('.token-value').text(event.data);
    }
    else if (event.field == 'ranking') {
      $('.wallet-ranking').text(event.data);
    }
    else if (event.field == 'accounts') {
      $('.accounts').text(event.data.length);
    }
    else if (event.field == 'bonus-credit') {
      $('.bonus-credit').text(event.data);
    }
  }

  const profileInfo = { ageRange: '18-25', workplace: 'Lisbon', cause: 'user-guid://school-0', balance: 10 };
  identity.profile = profileInfo;
  result.start(afterUpdate, identity);


  $('.wallet-delete').click(function () {
    result.removeWallet().then(function (result) {
      console.log('Wallet removed from DB');
    });
  });


  $('.wallet-read').click(function () {
    result.readWallet().then(function (result) {
      console.log('Wallet read from DB: ', result);
    });
  });


  // get public wallets
  /*
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

  result.start(afterUpdate, identity);*/
}
