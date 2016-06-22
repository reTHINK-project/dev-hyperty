
function hypertyLoaded(result) {

  $('.selection-panel').hide();

  let hypertyPanel = $('.hyperty-panel');

  let hi = '<p>Hyperty Observer URL: ' + result.runtimeHypertyURL + '</p>';

  console.log('Observer Waiting!!');
  let button = $('.search-btn');
  button.removeClass('hide');

  let email = $('.email-input');
  let observer = result.instance;
  observer.onChange(function(event) {
    let lblBattery = $('.bt-label');
    lblBattery.removeClass('hide');
    let lblSteps = $('.steps-label');
    lblSteps.removeClass('hide');
    console.log('new event', event);
    let stepValue = $('.value_step');
    let batteryValue = $('.value_battery');//stepValue.text = dataChanged
    let type = event.data[0].type;
    console.log('type', type);
    if (type === 'battery') {
      batteryValue.text(event.data[0].value);
      console.log(event.data[0].value);
    } else if (type === 'user_steps') {
      stepValue.text(event.data[0].value);
      console.log(event.data[0].value);
    }
  });
  button.on('click', function(event) {
    observer.discovery(email.val()).then(function(result) {
      console.log('resultt', result[0]);
      let collection = $('.collection');
      collection.empty();
      let collectionItem = '<li data-url="' + result[0].userID + '" class="collection-item avatar">' +
      '<span class="title"><b>UserURL: </b>' + result[0].userID + '</span><p>&nbsp;</p>' +
      '<p>' + result[0].descriptor + '<br>' + result[0].hypertyID + '</p>' +
      '<a title="Subscribe to ' + result[0].userID + '" class="waves-effect waves-light btn subscribe-btn secondary-content"><i class="material-icons">import_export</i></a>' +
      '</li>';
      collection.append(collectionItem);
      let subscribe = $('.subscribe-btn');
      subscribe.on('click', function(event) {
        observer.connect(result[0].hypertyID).then(function(urlDataObject) {
          console.log('Subscribed', urlDataObject);
          observer.ObserveBracelet(urlDataObject);
        });
      });
    });});

}
