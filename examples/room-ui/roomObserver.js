// "use strict";
var hyperty;

function hypertyLoaded(result) {

    let hypertyObserver;

    hypertyObserver = result.instance;

    console.log("hyperty loaded:", hypertyObserver);

    window.hyperty = hypertyObserver;
    hyperty = hypertyObserver;
    $('.observer').show();

    let urlform = $('.urlform');
    urlform.on('submit', subscribe);

    hyperty.addEventListener('onChange', function (event) {
        console.log('ONCHANGE: ', event);
        alert("room changed: " + JSON.stringify(event, null, 2));
    });

    $('#addchildbtn').click(addChild);


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
