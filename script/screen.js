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
            DodgeIt.prototype.controls_enter = function()
            {
                $("span.selected", container).click();
            };

            DodgeIt.prototype.controls_top = function()
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
            };

            DodgeIt.prototype.controls_down = function()
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
            };

            break;
        case "gameplay":
            this.gameplay_start(container);
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
        DodgeIt.prototype.controls_back = function()
        {
            that.screen_show("menu");
        };
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