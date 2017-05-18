// jshint browser:true, jquery: true
// jshint varstmt: false

let observer;

function hypertyLoaded(result) {

  $('.selection-panel').hide();

  console.log('[UserAvailabilityObserverDemo] started ', result);

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';
  $('.card-panel').html(hypertyInfo);

  console.log('UserAvailabilityObserverDemo Waiting!!');

    observer = result.instance;
    observer.onResumeObserver((usersAvailability) => {
      console.log('[UserAvailabilityObserverDemo - on Resume observers] :', usersAvailability);

      if (usersAvailability) {
        console.log('[UserAvailabilityObserverDemo - on Resume observers] resuming:', usersAvailability);
        observeUsersAvailability(usersAvailability);
        discoverUsers(observer);
      } else {
        console.log('[UserAvailabilityObserverDemo] Nothing to be resumed. Lets discover users availability to observer ');
        discoverUsers(observer);
      }
    });
    observer.start();
}

function discoverUsers(observer) {
  let email = $('.email-input');
  let domain = $('.domain-input');

  let searchForm = $('.search-form');
  let discoveryEl = $('.discover');

  observer = observer;

  discoveryEl.removeClass('hide');

  searchForm.on('submit', function(event) {

    event.preventDefault();

    observer.discoverUsers(email.val(), domain.val()).then(function(result) {
      console.log('[UserAvailabilityObserverDemo.discoverUsers] discovered: ', result);

      let collection = $('.collection');
      let collectionItem;
      collection.empty();
      collection.show();

      result.forEach((discoveredUser) => {

        if (discoveredUser.hasOwnProperty('userID')) {
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

        subscribe.on('click', discoverAvailability);
        collection.append($item);

      });
    });
  });
}

function discoverAvailability(event){

        console.log('[UserAvailabilityObserverDemo] ON SUBSCRIBE', event);

        event.preventDefault();

        let $currEl = $(event.currentTarget);
        let hyperty = $currEl.attr('hyperty-id');
        //let user = $currEl.attr('user-id');
        $('.collection').hide();

        observer.discoverAvailability(hyperty).then(function(urlDataObject) {
          console.log('[UserAvailabilityObserverDemo] Discovered UserAvailability: ', urlDataObject);

          observer.subscribeAvailability(urlDataObject).then(observerDataObject => {

            observeUserAvailability(observerDataObject);
    });
  });
}

function observeUsersAvailability(usersAvailability) {
  console.log('[UserAvailabilityObserverDemo.observeUsersAvailability]: ', usersAvailability);

    usersAvailability.forEach((user) => {
        observeUserAvailability(user);
    });

}

function observeUserAvailability(userAvailability) {
  console.log('[UserAvailabilityObserverDemo.observeUserAvailability]: ', userAvailability);

  //TODO: add each availability to user-list collection class

  let availabilityUrl = userAvailability.dataObject.url;

  let $userAvailability = $('<li/>')
       .addClass('user-list-item')
       .attr('url', availabilityUrl)
       .text(availabilityUrl);

  userAvailability.observe();

  if (userAvailability.dataObject.data && userAvailability.dataObject.data.values && userAvailability.dataObject.data.values.length > 0) {
    console.log('[UserAvailabilityObserverDemo.observeUserAvailability] last value :', userAvailability.dataObject.data.values[0].value);
    $userAvailability.removeClass('state-available state-unavailable state-busy state-away')
    .addClass('state-' + userAvailability.dataObject.data.values[0].value);
  }

  $('.user-list').append($userAvailability);

    userAvailability.addEventListener(availabilityUrl, function(event) {

        console.log('[UserAvailabilityObserverDemo.observeUserAvailability] Updated :', event);

        $userAvailability.removeClass('state-available state-unavailable state-busy state-away')
        .addClass('state-' + userAvailability.dataObject.data.values[0].value);
        $('.user-list').append($userAvailability);

      });
}
