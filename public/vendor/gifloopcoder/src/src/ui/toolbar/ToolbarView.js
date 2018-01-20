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

    function addExamples(){
        var exampleOptions = [
            
            {
              "id": 1,
              "webm" : "/vendor/gifloopcoder/src/examples/allshapes.webm",
              "text": "All Shapes"
            },
            {
              "id": 2,
              "webm" : "/vendor/gifloopcoder/src/examples/arc-segments.webm",
              "text": "Arc Segments"
            },
            {
              "id": 3,
              "webm" : "/vendor/gifloopcoder/src/examples/bezier-segments.webm",
              "text": "Bezier Segments"
            },
            {
              "id": 4,
              "webm" : "/vendor/gifloopcoder/src/examples/circles.webm",
              "text": "Circles"
            },
            {
              "id": 5,
              "webm" : "/vendor/gifloopcoder/src/examples/cubes.webm",
              "text": "Cubes"
            },
            {
              "id": 6,
              "webm" : "/vendor/gifloopcoder/src/examples/falling-stars.webm",
              "text": "Falling Stars"
            },
            {
              "id": 7,
              "webm" : "/vendor/gifloopcoder/src/examples/grid.webm",
              "text": "Grid"
            }
            ];

        var select = UIUtil.createDiv("toolbar_select", div);
        select.innerHTML = "<select class='select-glc-examples'><option value='-1'>Examples<select><br/>";

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
        })
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