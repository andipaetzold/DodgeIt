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

        if (data)
        {   
            // audio
            if (data.audio)
            {
                Audio.music.mute   = data.audio.music.mute;
                Audio.music.volume = data.audio.music.volume;

                Audio.sfx.mute     = data.audio.sfx.mute;
                Audio.sfx.volume   = data.audio.sfx.volume;
            }

            // options
            if (data.options)
            {
                this.options.name       = (data.options.name)  ? data.options.name  : this.options.name;
                this.options.car        = (data.options.car)   ? data.options.car   : this.options.car;
                this.options.speed      = (data.options.speed) ? data.options.speed : this.options.speed;
            }
        }

        this.allowSaving = true;
    };

    // save settings function
    var save = function()
    {
        if (this.allowSaving)
        {
            var data = {
                // audio
                audio: {
                    music: {
                        mute:   Audio.music.mute,
                        volume: Audio.music.volume
                    },

                    sfx: {
                        mute:   Audio.sfx.mute,
                        volume: Audio.sfx.volume
                    }
                },
                
                // controls
                controls: {},

                // options
                options: {
                    name:   this.options.name,
                    style:  this.options.car,
                    speed:  this.options.speed
                }
            };

            // save
            localStorage.setItem("options", JSON.stringify(data));            
        }
    };

    // INIT
    // options (default)
    var options = {
        name:   "Unknown",
        style:  "car",
        speed:  300
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