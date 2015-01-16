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

    // init
    this.controls_init();
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