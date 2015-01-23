// window.requestAnimationFrame         
if (!window.requestAnimationFrame)
{
    window.requestAnimationFrame = (function()
    {
        return window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               function(callback, element)
               {
                  window.setTimeout(callback, 1000 / 60);
               };
    })();
} 

// random range
Math.randomRange = function(min, max)
{
    return Math.random() * (max - min) + min;
};

// weighted random
Math.randomWeighted = function(data)
{
    var total = data.reduce(function(pv, cv) { return pv + cv; }, 0);

    var rand = Math.randomRange(0, total);
    var cur = 0;
    for (var i = 0; i <= data.length - 1; i++)
    {
        cur += data[i];
        if (rand < cur)
        {
            return i;
        }
    }
};

function DodgeIt(container)
{
    var that = this;

    // load function
    this.load = function()
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
                that.audio.music.mute   = data.audio.music.mute;
                that.audio.music.volume = data.audio.music.volume;

                that.audio.sfx.mute     = data.audio.sfx.mute;
                that.audio.sfx.volume   = data.audio.sfx.volume;
            }

            // options
            if (data.options)
            {
                that.options.name       = (data.options.name) ? data.options.name : that.options.name;
                that.options.car        = (data.options.car) ? data.options.car : that.options.car;
                that.options.speed      = (data.options.speed) ? data.options.speed : that.options.speed;
            }
        }

        allowSaving = true;
    };

    // save function
    var allowSaving = false;
    this.save = function()
    {
        if (allowSaving)
        {
            var data = {
                // audio
                audio: {
                    music: {
                        mute:   that.audio.music.mute,
                        volume: that.audio.music.volume
                    },

                    sfx: {
                        mute:   that.audio.sfx.mute,
                        volume: that.audio.sfx.volume
                    }
                },
                
                // controls
                controls: {},

                // options
                options: {
                    name:       that.options.name,
                    style:      that.options.car,
                    speed:      that.options.speed
                }
            };

            // save
            localStorage.setItem("options", JSON.stringify(data));            
        }
    };

    // clear container
    this.container = container;
    this.container.children().hide();

    // default options
    this.options = {
        name:   "Unknown",
        style:  "car",
        speed:  300
    };

    // init
    this.controls_init();
    this.audio.init(that);
    this.screen_init();

    // load options
    this.load();

    // show menu
    this.screen_show("menu");
}

var g;
$(document).ready(function()
{
    g = new DodgeIt($("#game"));
});