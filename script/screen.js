DodgeIt.prototype.screen_init = function()
{
    var that = this;
    var container;

    // menu
    container = $("div#menu", this.container);

    $("span", container).hover(function()
    {
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
    });

    $("span", container).click(function()
    {
        that.screen_show($(this).attr("data-screen"));
    });

    $("span:first", container).addClass("selected");

    // gameplay
    container = $("div#gameplay", this.container);

    // leaderboard
    container = $("div#leaderboard", this.container);

    // controls
    container = $("div#controls", this.container);

    // options
    container = $("div#options", this.container);

    // options - style
    $("input[data-option=style]", container).on("change", function()
    {
        that.options.style = $(this).val();
    });

    // options - music
    $("input#options-music-mute", container).on("change", function()
    {
        that.audio.music.mute_set(this.checked);
    });
    $("input#options-music-volume", container).on("change mousemove", function()
    {
        that.audio.music.volume_set($(this).val());
    });

    // options - sfx
    $("input#options-sfx-mute", container).on("change", function()
    {
        that.audio.sfx.mute_set(this.checked);
    });
    $("input#options-sfx-volume", container).on("change mousemove", function()
    {
        that.audio.sfx.volume_set($(this).val());
    });

    // about
    container = $("div#about", this.container);

    // general
    $("span.back", this.container).click(function()
    {
        that.screen_show("menu");
    });
}

DodgeIt.prototype.screen_show = function(screen)
{
    var container = $("div#"+screen, this.container);
    this.controls_reset();

    var that = this;

    // load data
    switch(screen)
    {
        case "menu":
            this.controls_command_set("enter", function()
            {
                $("span.selected", container).click();
            });

            this.controls_command_set("up", function()
            {
                var selected = $("span.selected", container);
                selected.removeClass("selected");
                if (selected.prevAll().length > 0)
                {
                    selected.prev().addClass("selected");
                }
                else
                {
                    selected.parent().children().last().addClass("selected");   
                }
            });

            this.controls_command_set("down", function()
            {
                var selected = $("span.selected", container);
                selected.removeClass("selected");
                if (selected.nextAll().length > 0)
                {
                    selected.next().addClass("selected");
                }
                else
                {
                    selected.parent().children().first().addClass("selected");   
                }
            });

            break;
        case "gameplay":
            this.gameplay();
            break;
        case "leaderboard":
            var table = $("table tbody", container).empty();
            var data = this.leaderboard.get(0, 10);
            $.each(data, function(index, item)
            {
                $("<tr></tr>")
                    .appendTo(table)
                    .append($("<td></td>").html(item.name))
                    .append($("<td></td>").html(item.score));
            });
            break;
        case "controls":
            // set keys
            $.each($("span[data-command]", container), function()
            {
                $(this).html(that.controls_format(that.controls.command[$(this).attr("data-command")]));
            });

            // get axes
            $("div#controls-gamepad-move", container).html("");
            $.each(this.controls.gamepad.axes, function(index, axes)
            {
                $("div#controls-gamepad-move", container)
                    .append(
                        $("<div></div>")
                            .append(
                                $("<label></label>")
                                    .append($("<input>")
                                        .attr("type", "radio")
                                        .attr("name", "controls-gamepad-move")
                                        .change(function(event)
                                        {
                                            that.controls.gamepad.axes_selected = $(this).parent().parent().prevAll().length;
                                        })
                                    )
                                    .append(
                                        $("<progress></progress>")
                                            .attr("min", 0)
                                            .attr("max", 2)
                                            .val(axes.x + 1)
                                    )
                                    .append(
                                        $("<progress></progress>")
                                            .attr("min", 0)
                                            .attr("max", 2)
                                            .val(axes.y + 1)
                                    )
                            )
                        );
            });

            // select
            if (this.controls.gamepad.axes_selected > this.controls.gamepad.axes.length - 1)
            {
                this.controls.gamepad.axes_selected = 0;
            }
            $("div#controls-gamepad-move div:nth-child(" + (this.controls.gamepad.axes_selected + 1) + ") label input", container).prop("checked", true);

            // update axes
            var axes_update = function()
            {
                // update progress bars
                $.each(that.controls.gamepad.axes, function(index, axes)
                {
                    var bars = $("div#controls-gamepad-move div:nth-child(" + (index + 1) + ") progress", container);
                    bars.first().val(axes.x + 1);
                    bars.last().val(axes.y + 1);
                });

                // next update
                if (container.is(":visible"))
                {
                    window.requestAnimationFrame(axes_update);   
                }
            };
            window.setTimeout(function() { window.requestAnimationFrame(axes_update); }, 500); // start getting visible

            // set change action
            $("td button", container).click(function()
            {
                var that2 = this;
                that.controls_set($(this).attr("data-command"), function(control)
                {
                    $("span[data-command=" + $(that2).attr("data-command") + "]").html(that.controls_format(control));
                });
            });
            break;
        case "options":
            // style
            $.each($("input[data-option=style]"), function()
            {
                $(this).attr("checked", that.options.style == $(this).val());
            });

            // music
            $("input#options-music-mute")
                .attr("checked", this.audio.music.mute_get());

            $("input#options-music-volume")
                .attr("max", this.audio.max)
                .val(this.audio.music.volume_get());

            // sfx
            $("input#options-sfx-mute")
                .attr("checked", this.audio.sfx.mute_get());

            $("input#options-sfx-volume")
                .attr("max", this.audio.max)
                .val(this.audio.sfx.volume_get());

            break;
        case "about":
            break;
        default:
            return;
    }

    // general
    if ($("span.back", container).length == 1)
    {
        this.controls_command_set("back", function()
        {
            that.screen_show("menu");
        });
    }

    // show screen
    if (container.siblings(":visible").length > 0)
    {
        container.siblings(":visible").fadeOut(250, function()
        {
            container.fadeIn(250);
        });
    }
    else
    {
        container.show();
    }
}