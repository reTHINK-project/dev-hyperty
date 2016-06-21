// "use strict";

var hyperty;

function hypertyLoaded(result) {


    hyperty = result.instance;

    console.log("hyperty loaded:", hyperty);

    window.hyperty = hyperty;
    $('.reporter').show();

    hyperty.addEventListener('objUrl', function (url) {
        console.log('objUrl event received:', url);
        let urlp = $('#url');
        urlp.append(url);
    });

    $('#modifybtn').click(modify);

    hyperty.addEventListener('onSubscribe', function (event) {
        console.log('ONSUBSCRIBE: ', event);
        alert("got subscription: " + JSON.stringify(event, null, 2));
    });

}

function modify() {
    console.log("modify");
    hyperty.modifyRoom();
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

