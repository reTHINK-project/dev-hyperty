// jshint browser:true, jquery: true
// jshint varstmt: false
/* global Handlebars */
/* global Materialize */


function hypertyLoaded(result) {
    console.log("hyperty loaded")

    

    result.instance.getCurrentPosition().then((position)=> {

      console.log("[LocationReporter.demo] current position: ", position)
       setTimeout(()=>{
           var map = new GMaps({
               el: '#map',
               lat: position.coords.latitude,
               lng: position.coords.longitude
           })

           map.addMarker({
               lat: position.coords.latitude,
               lng: position.coords.longitude,
               title: 'Your position'
           });
       }, 1000);

      //  GMaps.geolocate({
      //    success: function (position) {
      //      console.log('new position:', position);
      //    },
      //    error: function(error) {
      //      alert('Geolocation failed: '+error.message);
      //    },
      //    not_supported: function() {
      //      alert("Your browser does not support geolocation");
      //    }
      //  });
    });
}
