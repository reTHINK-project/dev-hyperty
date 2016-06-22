// "use strict";
var hyperty;

function hypertyLoaded(result) {

    let hypertyObserver;

    hypertyObserver = result.instance;

    console.log("hyperty loaded:", hypertyObserver);

    window.hyperty = hypertyObserver;
    hyperty = hypertyObserver;
    $('.observer').show();
    let rooms = $('#rooms');
    // add listener for new room objects and them to the table
    hyperty.addEventListener('newRoom', (room) => {
        let appendString =
            "<tr>" +
            "<td>" + room.data.name + "</td>" +
            "<td><pre>" + JSON.stringify(room.data, null, 2) + "</pre></td>" +
            "</tr>";
        rooms.append(appendString);
    });
}

function addChild() {
    console.log("ADDCHILD");
    hyperty.addChild();
}

function subscribe(event) {

    event.preventDefault();

    let urlform = $(event.currentTarget);

    let url = urlform.find('.roomurl').val();

    console.log("got url: ", url);

    hyperty.subscribe(url);
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
