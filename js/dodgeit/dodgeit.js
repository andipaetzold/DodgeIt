var DodgeIt = (function()
{
    // FUNCTIONS
    // allowed to save?
    var allowSaving = false;

    // load settings function
    var load = function()
    {
        allowSaving = false;

        // load
        var data = localStorage.getItem("options");
        try
        {
            data = JSON.parse(data);
        }
        catch (e)
        {
            return;
        }

        $.extend(true, options, data);

        allowSaving = true;
    };

    // save settings function
    var save = function()
    {
        if (allowSaving)
        {
            // save
            localStorage.setItem("options", JSON.stringify(options));
        }
    };

    // INIT
    // options (default)
    var options = {
        name:   "Unknown",
        style:  "car",
        speed:  300,

        music: {
            mute:   false,
            volume: 0.5
        },

        sfx: {
            mute:   false,
            volume: 0.5
        },

        controls: {
            up: {
                device: "keyboard",
                type:   null,
                code:   38
            },
            down: {
                device: "keyboard",
                type:   null,
                code:   40
            },
            left: {
                device: "keyboard",
                type:   null,
                code:   37
            },
            right: {
                device: "keyboard",
                type:   null,
                code:   39
            },
            enter: {
                device: "keyboard",
                type:   null,
                code:   13
            },
            back: {
                device: "keyboard",
                type:   null,
                code:   8
            }
        },

        gamepad: {
            axes_selected: 0
        }
    };

    // set container / hide
    var container = $("div#game");
    container.children().hide();

    // load options
    load();

    // RETURN
    return {
        container:  container,

        options:    options,

        load:       load,
        save:       save
    };
})();