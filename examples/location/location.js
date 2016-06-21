// jshint browser:true, jquery: true
// jshint varstmt: false
/* global Handlebars */
/* global Materialize */


function hypertyLoaded(result) {
    result.instance.getCurrentPosition()
           .then((position)=>{
                console.log(position)
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
            })
}
