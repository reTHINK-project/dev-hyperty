
function hypertyLoaded(result) {

  let hypertyObserver;

  hypertyObserver = result.instance;

  console.log(hypertyObserver);

  $('.selection-panel').hide();

  let hypertyPanel = $('.hyperty-panel');

  let hi = '<p>Hyperty Observer URL: ' + result.runtimeHypertyURL + '</p>';

  console.log('Observer Waiting!!');
  let button = $('.search-btn');
  button.removeClass('hide');

  let email = $('.email-input');
  let observer = result.instance;
  button.on('click', function(event) {
    observer.discovery(email.val()).then(function(result) {
      console.log('resultt', result[0]);
      let collection = $('.collection');
      let collectionItem = '<li data-url="' + result[0].userID + '" class="collection-item avatar">' +
      '<span class="title"><b>UserURL: </b>' + result[0].userID + '</span><p>&nbsp;</p>' +
      '<p>' + result[0].descriptor + '<br>' + result[0].hypertyID + '</p>' +
      '<a title="Call to ' + result[0].userID + '" class="waves-effect waves-light btn call-btn secondary-content"><i class="material-icons">call</i></a>' +
      '</li>';
    });});

}
