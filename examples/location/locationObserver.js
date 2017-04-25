// jshint browser:true, jquery: true
// jshint varstmt: false
/* global Handlebars */
/* global Materialize */


function hypertyLoaded(result) {
    console.log("hyperty loaded")
    result.instance.getUsersPosition()
           .then((positions)=>{
                var map = new GMaps({
                    el: '#map',
                    lat: 0,
                    lng:0
                })

                GMaps.geolocate({
                    success: function (position) {
                        map.setCenter(position.coords.latitude, position.coords.longitude)
                    },
                    error: function(error) {
                        alert('Geolocation failed: '+error.message);
                    },
                    not_supported: function() {
                        alert("Your browser does not support geolocation");
                    }
                })

                map.setZoom(2)

                positions.forEach(position=> map.addMarker({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        title: 'Your position'
                    }))
            })
}
