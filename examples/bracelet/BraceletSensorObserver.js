// jshint browser:true, jquery: true
// jshint varstmt: false

function hypertyLoaded(result) {

  $('.selection-panel').hide();

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';
  $('.card-panel').html(hypertyInfo);

  console.log('[BraceletSensorObserver] Observer Waiting!!');

  let email = $('.email-input');
  let domain = $('.domain-input');
  let observer = result.instance;

  let searchForm = $('.search-form');
  let discoveryEl = $('.discover');

  discoveryEl.removeClass('hide');

  searchForm.on('submit', function(event) {

    event.preventDefault();

    observer.discovery(email.val(), domain.val()).then(function(result) {
      console.log('[BraceletSensorObserver] Result:', result[0]);

      let collection = $('.collection');
      let collectionItem;
      collection.empty();

      if (result[0] && result[0].hasOwnProperty('userID')) {
        collectionItem = '<li data-url="' + result[0].userID + '" class="collection-item">' +
        '<span class="title"><b>UserURL: </b>' + result[0].userID + '</span>' +
        '<a title="Subscribe to ' + result[0].userID + '" class="waves-effect waves-light btn subscribe-btn secondary-content"><i class="material-icons">import_export</i></a>' +
        '<p><b>DescriptorURL: </b>' + result[0].descriptor + '<br><b>HypertyURL: </b>' + result[0].hypertyID +
        '<br><b>Resources: </b>' + JSON.stringify(result[0].resources) +
        '<br><b>DataSchemes: </b>' + JSON.stringify(result[0].dataSchemes) +
        '</p></li>';
      } else {
        collectionItem = '<li class="collection-item">' +
        '<span class="title">' + 'Not Found' + '</span>' +
        '</li>';
      }

      collection.append(collectionItem);

      let subscribe = $('.subscribe-btn');

      subscribe.on('click', function(event) {
        console.log('[BraceletSensorObserver] ON SUBSCRIBEE', event);

        event.preventDefault();

        observer.connect(result[0].hypertyID).then(function(DataObject) {
          console.log('[BraceletSensorObserver] Subscribed', DataObject);
          observer.ObserveBracelet(DataObject.url).then(observerDataObject => loadChart(observerDataObject.data.values[observerDataObject.data.values.length - 1].value,observerDataObject.data.values[observerDataObject.data.values.length - 2].value));
        });
      });
    });

  });

  Highcharts.setOptions({global: {useUTC: false}});

  function loadChart(firstValue,batteryVl) {
    $('#container').highcharts({
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
                load: function() {
                    let series = this.series[0];
                    let lblBattery = $('.bt-label');
                    let chart = $('#container');
                    let lblSteps = $('.steps-label');
                    let stepValue = $('.value_step');
                    let batteryValue = $('.value_battery');
                    chart.removeClass('hide');
                    lblBattery.removeClass('hide');
                    lblSteps.removeClass('hide');
                    batteryValue.text(batteryVl);
                    series.addPoint([(new Date()).getTime(), firstValue], true, true);
                    stepValue.text(firstValue);

                    observer.onChange(function(event) {
                      console.log('[BraceletSensorObserver] new event', event);
                      let type = event.data.type;
                      console.log('[BraceletSensorObserver] type', type);
                      if (type === 'battery') {
                        batteryValue.text(event.data.value);
                        console.log(event.data.value);
                      } else if (type === 'user_steps') {
                        let x = (new Date()).getTime();
                        series.addPoint([x, event.data.value], true, true);
                        console.log('[BraceletSensorObserver] series', series);
                        stepValue.text(event.data.value);
                        console.log(event.data.value);
                      }
                    });
                  }
              }
          },
        title: {
            text: 'User Steps'
          },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
          },
        yAxis: {
            title: {
                text: 'Value'
              },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
              }]
          },
        tooltip: {
            formatter: function() {
                return '<b>' + this.series.name + '</b><br/>' +
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                    Highcharts.numberFormat(this.y, 2);
              }
          },
        legend: {
            enabled: false
          },
        exporting: {
            enabled: false
          },
        series: [{
            name: 'Steps Data',
            data: (function() {
                // generate an array of random data
                let data = [];
                let time = (new Date()).getTime();
                let i;

                for (i = -19; i <= 0; i += 1) {
                  data.push({
                        x: time + i * 1000,
                        y: firstValue
                      });
                }
                return data;
              }())
          }]
      });
  }

}
