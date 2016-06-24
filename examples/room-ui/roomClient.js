// "use strict";
function hypertyLoaded(result) {

    let hyperty = result.instance;

    console.log("hyperty loaded:", hyperty);

    window.hyperty = hyperty;
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

    hyperty.addEventListener('changedRoom', (room) => {
        console.debug("room changed!:", room);
    });
}

function addChild() {
    console.log("ADDCHILD");
    window.hyperty.addChild();
}

function subscribe(event) {

    event.preventDefault();

    let urlform = $(event.currentTarget);

    let url = urlform.find('.roomurl').val();

    console.log("got url: ", url);

    window.hyperty.subscribe(url);
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
