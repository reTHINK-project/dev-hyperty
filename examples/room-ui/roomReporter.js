// "use strict";

var hyperty;

function hypertyLoaded(result) {


    hyperty = result.instance;

    console.log("hyperty loaded:", hyperty);

    window.hyperty = hyperty;
    $('.reporter').show();

    // add listener for roomMap and add each entry to the table
    hyperty.addEventListener('roomMap', function (roomMap) {
        console.debug('roomMap event received:', roomMap);
        let urls = $('#urls');
        for (room in roomMap) {
            let appendString =
                "<tr>" +
                "<td>" + room + "</td>" +
                "<td><pre>" + roomMap[room].url + "</pre></td>" +
                "</tr>";
            urls.append(appendString);
        }
    });

    $('#modifybtn').click(modify);

    hyperty.addEventListener('onSubscribe', function (event) {
        console.log('ONSUBSCRIBE: ', event);
        alert("got subscription: " + JSON.stringify(event, null, 2));
    });
}

function modify() {
    console.log("modify");
    hyperty.modifyRoom("2012");
}


Handlebars.getTemplate = function (name) {

    return new Promise(function (resolve, reject) {

        if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
            Handlebars.templates = {};
        } else {
            resolve(Handlebars.templates[name]);
        }

        $.ajax({
            url: 'templates/' + name + '.hbs',
            success: function (data) {
                Handlebars.templates[name] = Handlebars.compile(data);
                resolve(Handlebars.templates[name]);
            },

            fail: function (reason) {
                reject(reason);
            }
        });

    });

}

