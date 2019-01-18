
function hypertyLoaded(result, runtimeLoader = null) {

  console.log('UserActivityObserver hyperty loaded', result);

  $('.stop-hyperty').click(function () {
    result.stop();
  });

  $('.restart-hyperty').click(function () {
    function afterUpdate(event) {
      console.log('UserActivityObserver new update', event);
      if (event.field == 'balance') {
        $('.token-value').text(event.data);

      }
    }
    result.start(afterUpdate, null);
  });


  const isIOS = navigator.userAgent.indexOf('Mac') > -1;
  let domain;
  if (runtimeLoader != null) {
    runtimeLoader.requireProtostub('sharing-cities-dsm');
    // load stub according to OS
    // if (isIOS) {
    runtimeLoader.requireProtostub('fitness.strava.com');
    domain = 'strava.com';
    // }
    // else {
    //   runtimeLoader.requireProtostub('fitness.google.com');
    // idp = 'google.com';
    // }


    runtimeLoader.authorise(domain, 'user_activity_context').then(function (value) {
    }).catch(function (err) {
      console.log(err);

    });

    const walletName = 'Wallet';
    import('../../dev-hyperty/dist/' + walletName + '.hy')
      .then((hypertyModule) => {
        runtimeLoader.requireHyperty(walletUrl).then(function (res) {
          // your code
          console.log('loaded wallet ', res);
          const wallet = res;

          function getDistance(activities) {
            let distance = 0;
            activities.forEach(function (element) {
              distance += element.data.distance;
            });
            return distance;
          }

          function getTokens(activities) {
            let distance = 0;
            activities.forEach(function (element) {
              distance += element.value;
            });
            return distance;
          }


          // store in window
          window.wallet = wallet;

          function afterUpdate(event) {

            if (event.field === 'transactions') {
              console.log('wallet event: ', event.data);
              const activities = event.data.filter(trans => trans.source === 'user_activity');

              // walking
              const walkingActivities = activities.filter(activ => activ.data.activity === 'user_walking_context');

              // distance for activity
              const walkingDistance = getDistance(walkingActivities);
              $('.walking-distance').text(walkingDistance);

              // tokens for activity
              const walkingTokens = getTokens(walkingActivities);
              $('.walking-tokens').text(walkingTokens);

              // biking
              const bikingActivities = activities.filter(activ => activ.data.activity === 'user_biking_context');


              // TODO - parse and show info on sessions
              $('.token-amount').text(event.data.balance);
            }
          }

          res.identityManager
            .discoverUserRegistered()
            .then(function (identity) {
              let profileInfo = {};
              identity.profile = profileInfo;
              wallet.start(afterUpdate, identity);
            });
        })
          .catch(function (reason) {
            console.error(reason);
          });
      });

  }

  result.identityManager.discoverUserRegistered().then(function (identity) {
    hypertyReady(result, identity);
  });


}

function hypertyReady(result, identity) {
  console.log('UserActivityObserver hyperty Ready', result, identity);

  function afterUpdate(event) {
    console.log('UserActivityObserver new update', event);
    if (event.field == 'balance') {
      $('.token-value').text(event.data);

    }
  }
  result.start(afterUpdate, identity);
}
