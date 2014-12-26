function Game(container)
{
    // clear container
    this.container = container;
    container.html("");

    // scripts to load
    var scripts = [
        "script/menu.js",
        "script/gameplay.js",
        "script/audio.js",
        "script/controls.js",
        "script/gamepad.js"
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
}

$(document).ready(function()
{
    var g = new Game($("#game"));
});