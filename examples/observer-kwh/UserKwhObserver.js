// jshint browser:true, jquery: true
// jshint varstmt: false

let observer;
let discoveredHyperties = {};

function hypertyLoaded(result) {

  console.log('UserKwhObserverDemo hyperty loaded!! ', result);

  $('.selection-panel').hide();

  console.log('[UserKwhObserverDemo] started ', result);

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';
  $('.card-panel').html(hypertyInfo);

  console.log('UserKwhObserverDemo Waiting!! ');

    observer = result.instance;

    console.log('[UserKwhObserverDemo] observer Dataobject', observer);

    observer.start().then((usersAvailability)=>{
      if (usersAvailability) { observeUsersAvailability(usersAvailability); }

      discoverUsers(observer);

      observer.resumeDiscoveries().then( (discovered) => {
        console.log('UserKwhObserverDemo: Discoveries back to live ', discovered);
        if (discovered) {
          let collection = $('.collection');
          collection.empty();
          collection.show();
          showDiscoveredUser(discovered[0], collection);
        }
    });
  }).catch((reason) => {
    console.info('[UserKwhObserverDemo] start failed | ', reason);
  });
}

function discoverUsers(observer) {
  let email = $('.email-input');
  let name = $('.subscribe-legacy-name-input');
  let domain = $('.domain-input');

  let searchForm = $('.search-form');
  let subscribeLegacyForm = $('.subscribe-legacy-form');
  let subscribeLegay = $('.subscribe-legacy');
  let discoveryEl = $('.discover');

  observer = observer;

  discoveryEl.removeClass('hide');

  subscribeLegacyForm.on('submit', function(event) {
    event.preventDefault();
    console.log('lets susbcribe');
    //hyperty-catalogue://catalogue.localhost/.well-known/dataschema/Context
    observer._subscribeContext('hyperty-catalogue://catalogue.localhost/.well-known/dataschema/Context', name.val()).then(function(resultSubscribe) {
      observeUserAvailability(resultSubscribe);
    });
    // observer._discoverAndSubscribeLegacyUsers(name.val()).then(function(resultSubscribe) {
    //   console.log('[UserKwhObserverDemo.discoverUsers] result subscribe', resultSubscribe);
    //   observeUserAvailability(resultSubscribe);
    // })

  });
}


function subscribeAvailability(event){

        console.log('[UserKwhObserverDemo] ON SUBSCRIBE', event);

        event.preventDefault();

        let $currEl = $(event.currentTarget);
        let hyperty = $currEl.attr('hyperty-id');
        //let user = $currEl.attr('user-id');
        $('.collection').hide();
        console.log('[UserKwhObserverDemo] ON SUBSCRIBE', event, 'toObserve', discoveredHyperties[hyperty], 'using observer', observer);

        observer.observe(discoveredHyperties[hyperty]).then(function(availability) {
          console.log('[UserKwhObserverDemo.discoverAvailability] start observing: ', availability);

          observeUserAvailability(availability);
        });
      }

function observeUsersAvailability(usersAvailability) {
  console.log('[UserKwhObserverDemo.observeUsersAvailability]: ', usersAvailability);

    Object.keys(usersAvailability).forEach((user) => {
        observeUserAvailability(usersAvailability[user]);
    });

}

function observeUserAvailability(userAvailability) {
  console.log('[UserKwhObserverDemo.observeUserAvailability]: ', userAvailability);


  let availabilityUrl = 'Url:' + userAvailability.url + '   Name:' + userAvailability.metadata.name + '---Kwh Value:' + userAvailability.data.values[0].value;
  let $userAvailability = $('<li/>')
       .addClass('user-list-item')
       .attr('url', availabilityUrl)
       .text(availabilityUrl);

  $('.user-list').append($userAvailability);

  userAvailability.onChange('*', (event) => {
    console.log('[UserKwhObserverDemo.observeUserAvailability] onChange :', event);
    let availabilityUrl = 'Url:' + userAvailability.url + '   Name:' + userAvailability.metadata.name + '---Kwh Value:' + userAvailability.data.values[0].value;
    $userAvailability.removeAttr('url');
    $userAvailability.attr('url', availabilityUrl)
    .text(availabilityUrl);


  });

}
