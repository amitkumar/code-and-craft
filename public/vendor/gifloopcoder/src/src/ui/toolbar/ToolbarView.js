define(function(require) {

    var UIUtil = require("utils/UIUtil"),
        div = null,
        callbacks = null,
        buttons = null;

    function init() {
        div = UIUtil.createDiv("toolbar", document.getElementById("content"));
        callbacks = {};
        buttons = {};
        setKeyHandlers();
    }

    function addButton(id, img, text, callback) {
        var btn = UIUtil.createDiv("toolbar_button", div);
        btn.innerHTML = "<img src='" + img + "'><br/>" + text;
        btn.addEventListener("click", callback);
        buttons[id] = btn;
    }

    function addExamples(callback){
        var exampleOptions = [
            {
              "id": -1,
              "text": "Examples"
            },
            {
              "id": 1,
              "webm" : "/vendor/gifloopcoder/src/examples/allshapes.webm",
              "code" : "/vendor/gifloopcoder/src/examples/allshapes.js",
              "text": "All Shapes"
            },
            {
              "id": 2,
              "webm" : "/vendor/gifloopcoder/src/examples/arc-segments.webm",
              "code" : "/vendor/gifloopcoder/src/examples/arc-segments.js",
              "text": "Arc Segments"
            },
            {
              "id": 3,
              "webm" : "/vendor/gifloopcoder/src/examples/bezier-segments.webm",
              "code" : "/vendor/gifloopcoder/src/examples/bezier-segments.js",
              "text": "Bezier Segments"
            },
            {
              "id": 4,
              "webm" : "/vendor/gifloopcoder/src/examples/circles.webm",
              "code" : "/vendor/gifloopcoder/src/examples/circles.js",
              "text": "Circles"
            },
            {
              "id": 5,
              "webm" : "/vendor/gifloopcoder/src/examples/cubes.webm",
              "code" : "/vendor/gifloopcoder/src/examples/cubes.js",
              "text": "Cubes"
            },
            {
              "id": 6,
              "webm" : "/vendor/gifloopcoder/src/examples/falling-stars.webm",
              "code" : "/vendor/gifloopcoder/src/examples/falling-stars.js",
              "text": "Falling Stars"
            },
            {
              "id": 7,
              "webm" : "/vendor/gifloopcoder/src/examples/gears.webm",
              "code" : "/vendor/gifloopcoder/src/examples/gears.js",
              "text": "Gears"
            },
            {
              "id": 8,
              "webm" : "/vendor/gifloopcoder/src/examples/grid.webm",
              "code" : "/vendor/gifloopcoder/src/examples/grid.js",
              "text": "Grid"
            },
            {
              "id": 9,
              "webm" : "/vendor/gifloopcoder/src/examples/hearts.webm",
              "code" : "/vendor/gifloopcoder/src/examples/hearts.js",
              "text": "Hearts"
            },
            {
              "id": 10,
              "webm" : "/vendor/gifloopcoder/src/examples/isometric-grid.webm",
              "code" : "/vendor/gifloopcoder/src/examples/isometric-grid.js",
              "text": "Isometric Grid"
            },
            {
              "id": 11,
              "webm" : "/vendor/gifloopcoder/src/examples/polygons.webm",
              "code" : "/vendor/gifloopcoder/src/examples/polygons.js",
              "text": "Polygons"
            },
            {
              "id": 12,
              "webm" : "/vendor/gifloopcoder/src/examples/rays.webm",
              "code" : "/vendor/gifloopcoder/src/examples/rays.js",
              "text": "Rays"
            },
            {
              "id": 13,
              "webm" : "/vendor/gifloopcoder/src/examples/spiral.webm",
              "code" : "/vendor/gifloopcoder/src/examples/spiral.js",
              "text": "Spiral"
            },
            {
              "id": 14,
              "webm" : "/vendor/gifloopcoder/src/examples/text.webm",
              "code" : "/vendor/gifloopcoder/src/examples/text.js",
              "text": "Text"
            },
            {
              "id": 15,
              "webm" : "/vendor/gifloopcoder/src/examples/walking-lines.webm",
              "code" : "/vendor/gifloopcoder/src/examples/walking-lines.js",
              "text": "Text"
            }
            ];

        var select = UIUtil.createDiv("toolbar_select", div);
        select.innerHTML = "<select class='select-glc-examples'><br/>";

        $('.select-glc-examples').select2({
          width: '15em',
          data: exampleOptions,
          // dropdownCss : 'select2-glc-examples',
          templateResult: function(state){
            var $item = $(
              '<div><video class="video" loop autoplay src="' + state.webm + '"></video><span class="text">' + state.text + '</span></div>'
            );
            return $item;
          }
        }).on('select2:select', function(e){
            console.log('select2:select e.params.data', e.params.data, 'e', e);
            var data = e.params.data;
            if (data.code){
                callback(data.code);
            }
        });
    }

    function setKey(key, event, callback) {
        callbacks[key] = {
            callback: callback,
            event: event
        };
    }

    function addSeparator() {
        UIUtil.createDiv("toolbar_separator", div);
    }

    function setKeyHandlers() {
        document.body.addEventListener("keyup", function(event) {
            if(event.ctrlKey && callbacks[event.keyCode]) {
                if(callbacks[event.keyCode].event == "keyup") {
                    callbacks[event.keyCode].callback();
                }
                event.preventDefault();
            }
        });
        document.body.addEventListener("keydown", function(event) {
            if(event.ctrlKey && callbacks[event.keyCode]) {
                if(callbacks[event.keyCode].event == "keydown") {
                    callbacks[event.keyCode].callback();
                }
                event.preventDefault();
            }
        });
    };

    function enableBtn(id) {
        buttons[id].className = "toolbar_button";
    }

    function disableBtn(id) {
        buttons[id].className = "toolbar_button disabled";
    }

    function setDirty(dirty) {
        if(glcConfig.isStandalone && buttons["save_btn"]) {
            if(dirty) {
                buttons["save_btn"].className = "toolbar_button dirty";
            }
            else {
                buttons["save_btn"].className = "toolbar_button";
            }
        }
    }


    return {
        init: init,
        addButton: addButton,
        addSeparator: addSeparator,
        addExamples : addExamples,
        enableBtn: enableBtn,
        disableBtn: disableBtn,
        setKey: setKey,
        setDirty: setDirty
    }

});