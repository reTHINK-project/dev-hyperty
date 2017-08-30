// "use strict";

function hypertyLoaded(result) {
    hyperty = result.instance;
    window.hyperty = hyperty;

    console.log("hyperty loaded:", hyperty);
    $('#modifybtn').click(modify);
}

function modify() {
    console.log("modify");
    window.hyperty.modifyRoom("2012");
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

