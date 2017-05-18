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

  observer.onResumeObserver((userAvailability) => {
    console.log('[UserAvailabilityObserverDemo - on Resume observers] :', userAvailability);

    if (userAvailability) {
      console.log('[UserAvailabilityObserverDemo - on Resume observers] resuming:', userAvailability);
      observer.observe(userAvailability);
      observeUserAvailability(observer, userAvailability);

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

    observer.discovery(email.val(), domain.val()).then(function(result) {
      console.log('[UserAvailabilityObserverDemo.discoverUsers] discovered: ', result);

      let collection = $('.collection');
      let collectionItem;
      collection.empty();

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

        subscribe.on('click', connect);
        collection.append($item);

      });
    });
  });
}

function connect(event){

        console.log('[UserAvailabilityObserverDemo] ON SUBSCRIBE', event);

        event.preventDefault();

        let $currEl = $(event.currentTarget);
        let hyperty = $currEl.attr('hyperty-id');
        let user = $currEl.attr('user-id');
        $('.collection').hide();

        observer.connect(hyperty).then(function(urlDataObject) {
          console.log('[UserAvailabilityObserverDemo] Subscribed', urlDataObject);

          observer.subscribeAvailability(urlDataObject).then(observerDataObject => {

            observeUserAvailability(observer, observerDataObject, user);
    });
  });
}

function observeUserAvailability(observer, userAvailability, user) {
  console.log('[UserAvailabilityObserverDemo.observeUserAvailability]: ', userAvailability);

  let $availability = $('.value_availability');
  let $userId = $('.availability_label');
  $userId.removeClass('hide');
  $userId.text('Availability of '+ user + ' : ');

  if (userAvailability.data && userAvailability.data.values && userAvailability.data.values.legth > 0) {
    $availability.text(userAvailability.data.values[0].value);
  }

  observer.addEventListener('user-availability', function(event) {

      console.log('[UserAvailabilityObserverDemo.observeUserAvailability] Updated :', event);

      $availability.text(userAvailability.data.values[0].value);

    });
}
