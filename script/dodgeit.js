function DodgeIt(container)
{
    // clear container
    this.container = container;
    this.container.html("");

    // scripts to load
    var scripts = [
        "script/include/jquery.cookie.js",
        "script/screen.js",
        "script/include/canvasquery.js",
        "script/include/playground.js",
        "script/gameplay.js",
        "script/audio.js",
        "script/controls.js",
        "script/gamepad.js",
        "script/leaderboard.js"
    ];

    // load
    var progress = $("<progress></progress>")
                   .attr("min", 0)
                   .attr("max", scripts.length)
                   .val(0)
                   .appendTo(this.container);

    $.each(scripts, function(index, value)
    {
        $.ajax({
            url: value,
            success: function()
            {
                progress.val(progress.val() + 1);
            },
            dataType: "script",
            async: false
        });
    });

    this.controls_init();
    this.audio.music.init();

    this.screen_menu();
}

var g;
$(document).ready(function()
{
    g = new DodgeIt($("#game"));
});