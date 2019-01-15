// jshint browser:true, jquery: true
// jshint varstmt: false

let observer;
let discoveredHyperties = {};

function hypertyLoaded(result) {

  console.log('UserAvailabilityObserverDemo hyperty loaded!! ', result);

  $('.selection-panel').hide();

  console.log('[UserAvailabilityObserverDemo] started ', result);

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';
  $('.card-panel').html(hypertyInfo);

  console.log('UserAvailabilityObserverDemo Waiting!! ');

    observer = result;

    console.log('[UserAvailabilityObserverDemo] observer Dataobject', observer);

    observer.start().then((usersAvailability)=>{
      if (usersAvailability) { observeUsersAvailability(usersAvailability); }

      discoverUsers(observer);

      observer.resumeDiscoveries().then( (discovered) => {
        console.log('UserAvailabilityObserverDemo: Discoveries back to live ', discovered);
        if (discovered) {
          let collection = $('.collection');
          collection.empty();
          collection.show();
          showDiscoveredUser(discovered[0], collection);
        }
    });
  }).catch((reason) => {
    console.info('[UserAvailabilityObserverDemo] start failed | ', reason);
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

  searchForm.on('submit', function(event) {

    event.preventDefault();

    observer.discoverUsers(email.val(), domain.val()).then(function(result) {
      console.log('[UserAvailabilityObserverDemo.discoverUsers] discovered: ', result);

      let collection = $('.collection');
      collection.empty();
      collection.show();

      result.forEach((discoveredUser)=>{
        showDiscoveredUser(discoveredUser, collection)
      });
    });
  });
  subscribeLegacyForm.on('submit', function(event) {
    event.preventDefault();
    console.log('lets susbcribe');
    observer._discoverAndSubscribeLegacyUsers(name.val()).then(function(resultSubscribe) {
      console.log('[UserAvailabilityObserverDemo.discoverUsers] result subscribe', resultSubscribe);
      observeUserAvailability(resultSubscribe);
    })

  });
}

function showDiscoveredUser(discoveredUser, collection){

  let collectionItem;

    if (discoveredUser.hasOwnProperty('userID')) {
      discoveredHyperties[discoveredUser.hypertyID] = discoveredUser;
      collectionItem = '<li data-url="' + discoveredUser.userID + '" class="collection-item">' +
      '<span class="title"><b>UserURL: </b>' + discoveredUser.userID + '</span>' +
      '<a hyperty-id= "'+discoveredUser.hypertyID+'" user-id= "'+discoveredUser.userID+'" href="#" title="Subscribe to ' + discoveredUser.userID + '" class="waves-effect waves-light btn subscribe-btn secondary-content" ><i class="material-icons">import_export</i></a>' +
      '<p><b>DescriptorURL: </b>' + discoveredUser.descriptor + '<br><b> HypertyURL: </b>' + discoveredUser.hypertyID +
      '<br><b>Resources: </b>' + JSON.stringify(discoveredUser.resources) +
      '<br><b>DataSchemes: </b>' + JSON.stringify(discoveredUser.dataSchemes) +
      '</p></li>';
    } else {
      collectionItem = '<li class="collection-item">' +
      '<span class="title">' + discoveredUser + '</span>' +
      '</li>';
    }

    let $item = $(collectionItem);

    let subscribe = $item.find('.subscribe-btn');

    subscribe.on('click', subscribeAvailability );
    collection.append($item);

}

function subscribeAvailability(event){

        console.log('[UserAvailabilityObserverDemo] ON SUBSCRIBE', event);

        event.preventDefault();

        let $currEl = $(event.currentTarget);
        let hyperty = $currEl.attr('hyperty-id');
        //let user = $currEl.attr('user-id');
        $('.collection').hide();
        console.log('[UserAvailabilityObserverDemo] ON SUBSCRIBE', event, 'toObserve', discoveredHyperties[hyperty], 'using observer', observer);

        observer.observe(discoveredHyperties[hyperty]).then(function(availability) {
          console.log('[UserAvailabilityObserverDemo.discoverAvailability] start observing: ', availability);

          observeUserAvailability(availability);
        });
      }

function observeUsersAvailability(usersAvailability) {
  console.log('[UserAvailabilityObserverDemo.observeUsersAvailability]: ', usersAvailability);

    Object.keys(usersAvailability).forEach((user) => {
        observeUserAvailability(usersAvailability[user]);
    });

}

function observeUserAvailability(userAvailability) {
  console.log('[UserAvailabilityObserverDemo.observeUserAvailability]: ', userAvailability);

  //TODO: add each availability to user-list collection class

  let availabilityUrl = 'Url:' + userAvailability.url + '   Name:' + userAvailability.metadata.name;
  let $userAvailability = $('<li/>')
       .addClass('user-list-item')
       .attr('url', availabilityUrl)
       .text(availabilityUrl);

  //userAvailability.observe();

  if (userAvailability.data && userAvailability.data.values && userAvailability.data.values.length > 0) {
    console.log('[UserAvailabilityObserverDemo.observeUserAvailability] last value :', userAvailability.data.values[0].value);
    $userAvailability.removeClass('state-available state-unavailable state-busy state-away')
    .addClass('state-' + userAvailability.data.values[0].value);
  }

  $('.user-list').append($userAvailability);

  userAvailability.onChange('*', (event) => {
    console.log('[UserAvailabilityObserverDemo.observeUserAvailability] onChange :', event);

    $userAvailability.removeClass('state-available state-unavailable state-busy state-away')
    .addClass('state-' + userAvailability.data.values[0].value);
    $('.user-list').append($userAvailability);
  });

}
