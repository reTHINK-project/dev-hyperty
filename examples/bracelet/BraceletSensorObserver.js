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

  console.log('Observer Waiting!!');

  let email = $('.email-input');
  let observer = result.instance;

  let searchForm = $('.search-form');
  let discoveryEl = $('.discover');

  discoveryEl.removeClass('hide');

  searchForm.on('submit', function(event) {

    event.preventDefault();

    observer.discovery(email.val()).then(function(result) {
      console.log('Result:', result[0]);

      let collection = $('.collection');
      let collectionItem;
      collection.empty();

      if (result[0].hasOwnProperty('userID')) {
        collectionItem = '<li data-url="' + result[0].userID + '" class="collection-item">' +
        '<span class="title"><b>UserURL: </b>' + result[0].userID + '</span>' +
        '<a title="Subscribe to ' + result[0].userID + '" class="waves-effect waves-light btn subscribe-btn secondary-content"><i class="material-icons">import_export</i></a>' +
        '<p><b>DescriptorURL: </b>' + result[0].descriptor + '<br><b>HypertyURL: </b>' + result[0].hypertyID +
        '<br><b>Resources: </b>' + JSON.stringify(result[0].resources) +
        '<br><b>DataSchemes: </b>' + JSON.stringify(result[0].dataSchemes) +
        '</p></li>';
      } else {
        collectionItem = '<li class="collection-item">' +
        '<span class="title">' + result[0] + '</span>' +
        '</li>';
      }

      collection.append(collectionItem);

      let subscribe = $('.subscribe-btn');

      subscribe.on('click', function(event) {

        event.preventDefault();

        observer.connect(result[0].hypertyID).then(function(urlDataObject) {
          console.log('Subscribed', urlDataObject);
          observer.ObserveBracelet(urlDataObject).then(observerDataObject => loadChart(observerDataObject.data.values[1].value));
        });
      });
    });

  });

  Highcharts.setOptions({global: {useUTC: false}});

  function loadChart(firstValue) {
    $('#container').highcharts({
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
                load: function() {
                    let series = this.series[0];
                    observer.onChange(function(event) {
                      let lblBattery = $('.bt-label');
                      let chart = $('#container');
                      chart.removeClass('hide');
                      lblBattery.removeClass('hide');
                      let lblSteps = $('.steps-label');
                      lblSteps.removeClass('hide');
                      let stepValue = $('.value_step');
                      let batteryValue = $('.value_battery');
                      console.log('new event', event);
                      let type = event.data[0].type;
                      console.log('type', type);
                      if (type === 'battery') {
                        batteryValue.text(event.data[0].value);
                        console.log(event.data[0].value);
                      } else if (type === 'user_steps') {
                        let x = (new Date()).getTime();

                        series.addPoint([x, event.data[0].value], true, true);
                        console.log('series', series);
                        stepValue.text(event.data[0].value);
                        console.log(event.data[0].value);
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
