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

function DodgeIt(container)
{
    var that = this;

    // load function
    this.load = function()
    {
        allowSaving = false;

        // load
        var data = localStorage.getItem("options");
        data = JSON.parse(data);

        // audio
        if (data.audio)
        {
            that.audio.music.mute_set(data.audio.music.mute);
            that.audio.music.volume_set(data.audio.music.volume);

            that.audio.sfx.mute_set(data.audio.sfx.mute);
            that.audio.sfx.volume_set(data.audio.sfx.volume);
        }

        // options
        if (data.options)
        {
            that.options = data.options;            
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
                        mute:   that.audio.music.mute_get(),
                        volume: that.audio.music.volume_get()
                    },

                    sfx: {
                        mute:   that.audio.sfx.mute_get(),
                        volume: that.audio.sfx.volume_get()
                    }
                },
                
                // controls
                controls: {},

                // options
                options: that.options
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
        style: "car"
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