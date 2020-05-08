(function() {
// Redraw plots on page resize
    window.addEventListener("resize", resizeThrottler, false);
    var resizeTimeout;

    function resizeThrottler() {
        // ignore resize events as long as an actualResizeHandler execution is in the queue
        if ( !resizeTimeout ) {
            resizeTimeout = setTimeout(function() {
                resizeTimeout = null;
                actualResizeHandler();

                // The actualResizeHandler will execute at a rate of 15fps
            }, 66);
        }
    }

    function actualResizeHandler() {
        _resize ();
        calcIt();
    }

}());

function showTooltip(x, y, contents) {
    $('<div id="tooltip">' + contents + '</div>').css({
        position: 'absolute',
        display: 'none',
        top: y + 5,
        left: x + 5,
        border: '1px solid #b4b4ff',
        padding: '2px',
        'background-color': '#c4c4ff',
        opacity: 0.80
    }).appendTo("body").fadeIn(200);
}

function setupInput(store, selector) {
    var ThemAll;
    if (localStorage) {
        ThemAll = localStorage.getItem(store);
    }

    if (ThemAll) {
        var s = ThemAll.split("\n");
        var sl = "";
        selector.each(function () {
            for (i = 0; i < s.length; i++) {
                if (s[i].indexOf(this.id) === 0) {
                    sl = s[i].split(":");
                    if (this.type === "checkbox" || this.type === "radio") {
                        if (sl[1] === "true") {
                            this.checked = true;
                        } else {
                            this.checked = false;
                        }
                    }
                    else {
                        if ($(this).attr("id").indexOf("Slide") >= 0) {
                            $(this).slider('setValue', parseFloat(sl[1]));
                        }
                        else {
                            this.value = sl[1];
                        }
                    }
                    break;
                }
            }
        }).change(function () {
            CalcIt();
        });
        $("select").each(function (index) {
            for (i = 0; i < s.length; i++) {
                if (s[i].indexOf(this.id) == 0) {
                    sl = s[i].split(":");
                    this.value = sl[1]
                }
            }
        }).change(function () {
            CalcIt();
        });
    }
}

function setupCheckRadio(selector) {
    var ThemAll = "";
    selector.each(function () {
            if (this.type === "checkbox" || this.type === "radio") {
                ThemAll += this.id + ":" + this.checked + "\n";
            }
            else {
                ThemAll += this.id + ":" + this.value + "\n";
            }
        }
    );
    $("select").each(function (index) {
        ThemAll += this.id + ":" + this.value + "\n";
    })

    return ThemAll;
}