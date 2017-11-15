// jshint browser:true, jquery: true
// jshint varstmt: false

let observer;
let discoveredHyperties = {};
let map;

function hypertyLoaded(result) {

  console.log('ContextObserverDemo hyperty loaded!! ', result);

  $('.selection-panel').hide();

  console.log('[ContextObserverDemo] started ', result);

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';
  $('.card-panel').html(hypertyInfo);

  console.log('ContextObserverDemo Waiting!! ');

    observer = result.instance;

  observer.start().then((usersContext)=>{

  console.log('usersContext', usersContext);



    setTimeout(() => {
      map = new GMaps({
        el: '#map',
        lat: 0,
        lng:0
      });
      GMaps.geolocate({
        success: function (position) {
          console.log('POSITION;OBSERVER:', position);
          map.setCenter(position.coords.latitude, position.coords.longitude)
        },
        error: function(error) {
          alert('Geolocation failed: '+error.message);
        },
        not_supported: function() {
          alert("Your browser does not support geolocation");
        }
      });


      map.setZoom(8);

      if (usersContext) { observeUsersContext(usersContext); }

      discoverUsers(observer);

      observer.resumeDiscoveries().then( (discovered) => {
        console.log('ContextObserverDemo: Discoveries back to live ', discovered);
        if (discovered) {
          let collection = $('.collection');
          collection.empty();
          collection.show();
          showDiscoveredUser(discovered[0], collection);
        }
    });


    }, 1000);

  }).catch((reason) => {
    console.info('[ContextObserverDemo] start failed | ', reason);
  });


  /*observer.watchUsersPosition((callback) => {

    console.log('on callback', callback);


  });*/
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
      console.log('[ContextObserverDemo.discoverUsers] discovered: ', result)

      let collection = $('.collection');
      collection.empty();
      collection.show();

      result.forEach((discoveredUser)=>{
        showDiscoveredUser(discoveredUser, collection)
      });
    });
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

    subscribe.on('click', subscribeContext );
    collection.append($item);

}

function subscribeContext(event){

        console.log('[ContextObserverDemo] ON SUBSCRIBE', event);

        event.preventDefault();

        let $currEl = $(event.currentTarget);
        let hyperty = $currEl.attr('hyperty-id');
        //let user = $currEl.attr('user-id');
        $('.collection').hide();

        observer.observe(discoveredHyperties[hyperty]).then(function(context) {
          console.log('[ContextObserverDemo.discoverAvailability] start observing: ', context);

          observeUserContext(context);
        });
      }

function observeUsersContext(usersContext) {
  console.log('[ContextObserverDemo.observeUsersContext]: ', usersContext);

    Object.keys(usersContext).forEach((user) => {
        observeUserContext(usersContext[user]);
    });

}

function observeUserContext(userContext) {
  console.log('[ContextObserverDemo.observeUserContext]: ', userContext);

  //TODO: add each context to user-list collection class

  let contextUrl = userContext.url;

  let $userContext = $('<li/>')
       .addClass('user-list-item')
       .attr('url', contextUrl)
       .text(contextUrl);

  //userContext.observe();

  if (userContext.data && userContext.data.values && userContext.data.values.length > 0) {
    console.log('[ContextObserverDemo.observeUserContext] last value :', userContext.data.values);
    //$userContext.addClass('state-' + userContext.data.values[0].value);
    createMap();
    addMarker(userContext.data.values);
  }

//  $('.user-list').append($userContext);

  userContext.onChange('*', (event) => {
    console.log('[ContextObserverDemo.observeUserContext] onChange :', event);

    if (event.field === "values") {

      addMarker([{value:event.data[0].value}, {value:event.data[1].value}]);

    }

    $userContext.removeClass('state-available state-unavailable state-busy state-away')
    .addClass('state-' + userContext.data.values[0].value);
    $('.user-list').append($userContext);
  });

}

function createMap() {
  if(!map) {
    map = new GMaps({
      el: '#map',
      lat: 0,
      lng:0
    });
  }
  console.log('MAP->', map);
}

function addMarker(position) {
/*
  position.coords.latitude = position.values[0].value
  position.coords.longitude = position.values[1].value*/
  map.removeMarkers(map.markers);
  map.addMarker({
      lat: position[0].value,
      lng: position[1].value,
      title: position.tag,
      infoWindow: {
          content: `<p>${position.tag}</p>`
      }
  });
}
