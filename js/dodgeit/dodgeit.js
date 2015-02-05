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