function DodgeIt(container)
{
    // clear container
    this.container = container;
    this.container.children().hide();

    // scripts to load
    var scripts = [
        "script/include/jquery.cookie.js",
        "script/screen.js",
        "script/include/canvasquery.js",
        "script/include/playground.js",
        "script/gameplay.js",
        "script/audio.js",
        "script/controls.js",
        "script/leaderboard.js"
    ];

    // load
    $.each(scripts, function(index, value)
    {
        $.ajax({
            url: value,
            dataType: "script",
            async: false
        });
    });

    // default options
    this.options = {
        style: "car"
    };

    // controls    
    this.controls = {
        command: {},
        set: {
            active:     false,
            key:        "",
            abort:      27,
            callback:   null
        }
    }
    this.controls_init();

    // init
    this.audio.music.init();
    this.audio.sfx.init();

    this.screen_init();
    this.screen_show("menu");
}

var g;
$(document).ready(function()
{
    g = new DodgeIt($("#game"));
});