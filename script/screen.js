DodgeIt.prototype.screen_init = function()
{
    var that = this;

    // get screens
    var screens = [
        "menu",
        "gameplay",
        "leaderboard",
        "gameplay-gameover",
        "gameplay-restart",
        "controls",
        "options",
        "about"
    ];
    container = {};

    $.each(screens, function(index, value)
    {
        container[value] = $("div#" + value, this.container);
    });

    // menu
    $("span", container["menu"]).hover(function()
    {
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
    });

    $("span", container["menu"]).click(function()
    {
        that.screen_show($(this).attr("data-screen"));
    });

    $("span:first", container["menu"]).addClass("selected");

    // gameplay

    // gameplay-gameover
    // gameplay-gameover - hover 
    $("table", container["gameplay-gameover"]).delegate("td", "mouseover", function(v)
    {
        $("table tr td", container["options"]).removeClass("selected");
        $(this).addClass("selected");
    });

    // gameplay-gameover - restrict input text
    $("input[type=text]", container["gameplay-gameover"]).keypress(function(event)
    {
        var regex = /^[a-zA-Z0-9]*$/;
        var str = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        return regex.test(str);
    });

    // gameplay-gameover - click
    $("table", container["gameplay-gameover"]).delegate("td", "click", function()
    {
        var input = $("input[type=text]", container["gameplay-gameover"]);
        switch ($(this).attr("data-action"))
        {
            case "add":
                if (input.prop("maxlength") > input.val().length)
                {
                    input.val(input.val() + $(this).attr("data-symbol"));
                }
                break;
            case "delete":
                input.val(input.val().slice(0, -1));
                break;
            case "cancel":
                that.screen_show("menu");
                break;
            case "submit":
                that.leaderboard.post(input.val(), $("span.score", container["gameplay-gameover"]).html());
                that.screen_show("gameplay-restart");
                break;
            default:
                break;
        }
    });

    // gameplay-restart
    $("table tr td:nth-child(1)", container["gameplay-restart"]).click(function(event)
    {
        that.screen_show("gameplay");
    });
    $("table tr td:nth-child(2)", container["gameplay-restart"]).click(function(event)
    {
        that.screen_show("menu");
    });

    $("table tr td", container["gameplay-restart"]).hover(function()
    {   
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
    });

    // leaderboard

    // controls

    // options
    $("tbody tr", container["options"]).hover(function()
    {
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
    });

    // options - style
    $("input[data-option=style]", container["options"]).on("change", function()
    {
        that.options.style = $(this).val();
        that.save();
    });

    // options - music
    $("input#options-music-mute", container["options"]).on("change", function()
    {
        that.audio.music.mute = this.checked;
    });
    $("input#options-music-volume", container["options"]).on("change mousemove", function()
    {
        that.audio.music.volume = $(this).val();
    });

    // options - sfx
    $("input#options-sfx-mute", container["options"]).on("change", function()
    {
        that.audio.sfx.mute = this.checked;
    });
    $("input#options-sfx-volume", container["options"]).on("change mousemove", function()
    {
        that.audio.sfx.volume = $(this).val();
    });

    // about

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

    var loop_function = null;

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

            // loop
            loop_function = function()
            {
                that.controls_gamepad_poll(false);
            };

            break;
        case "gameplay":
            this.gameplay();
            break;
        case "leaderboard":
            that.leaderboard.get(0, 10, $("table", container));
            
            // loop
            loop_function = function()
            {
                that.controls_gamepad_poll(false);
            };
            break;
        case "gameplay-gameover":
            // controls
            this.controls_command_set("up", function()
            {
                var selected = $("table tr td.selected", container);
                if (selected.parent().prevAll().length > 0)
                {
                    // calc child_id
                    var child_id = 1;
                    $.each(selected.prevAll(), function(index, value)
                    {
                        child_id += $(value).prop("colspan");
                    });

                    // select
                    selected.removeClass("selected");

                    var selected_new = selected.parent().prev().children().first();
                    while (child_id > 0)
                    {
                        var tmp = selected_new.prop("colspan");
                        if (child_id > selected_new.prop("colspan"))
                        {
                            selected_new = selected_new.next();
                        }

                        child_id -= tmp;
                    }

                    selected_new.addClass("selected");
                }
            });

            this.controls_command_set("down", function()
            {
                var selected = $("table tr td.selected", container);
                if (selected.parent().nextAll().length > 0)
                {
                    // calc child_id
                    var child_id = 1;
                    $.each(selected.prevAll(), function(index, value)
                    {
                        child_id += $(value).prop("colspan");
                    });

                    // select
                    selected.removeClass("selected");

                    var selected_new = selected.parent().next().children().first();
                    while (child_id > 0)
                    {
                        var tmp = selected_new.prop("colspan");
                        if (child_id > selected_new.prop("colspan"))
                        {
                            selected_new = selected_new.next();
                        }

                        child_id -= tmp;
                    }

                    selected_new.addClass("selected");
                }
            });

            this.controls_command_set("left", function()
            {
                var selected = $("table tr td.selected", container);
                if (selected.prevAll().length > 0)
                {
                    selected.removeClass("selected");
                    selected.prev().addClass("selected");
                }
            });

            this.controls_command_set("right", function()
            {
                var selected = $("table tr td.selected", container);
                if (selected.nextAll().length > 0)
                {
                    selected.removeClass("selected");
                    selected.next().addClass("selected");
                }
            });

            this.controls_command_set("enter", function()
            {
                $("table tr td.selected", container).click();
            });

            // select first
            $("table tr td.selected", container).removeClass("selected");
            $("table tr:nth-child(1) td:nth-child(1)", container).addClass("selected");

            // set text
            $("input[type=text]", container).val("Unknown");
            
            // loop
            loop_function = function()
            {
                that.controls_gamepad_poll(false);
            };
            break;
        case "gameplay-restart":
            this.controls_command_set("left", function()
            {
                $("table tr td:nth-child(1)", container).addClass("selected");
                $("table tr td:nth-child(2)", container).removeClass("selected");
            });

            this.controls_command_set("right", function()
            {
                $("table tr td:nth-child(1)", container).removeClass("selected");
                $("table tr td:nth-child(2)", container).addClass("selected");
            });

            this.controls_command_set("enter", function()
            {
                $("table tr td.selected", container).click();
            });

            // select Yes
            $("table tr td:nth-child(1)", container).addClass("selected");
            $("table tr td:nth-child(2)", container).removeClass("selected");

            // loop
            loop_function = function()
            {
                that.controls_gamepad_poll(false);
            };
            break;
        case "controls":
            // poll gamepad
            this.controls_gamepad_poll(true);

            // set keys
            $.each($("span[data-command]", container), function()
            {
                $(this).html(that.controls_format(that.controls.command[$(this).attr("data-command")]));
            });

            // set change action
            $("td button", container).click(function()
            {
                var that2 = this;

                // block buttons
                $("button", $(this).parent().parent().siblings().andSelf()).prop("disabled", true);

                // text
                var textContainer = $("span[data-command=" + $(this).attr("data-command") + "]");
                var tmp = textContainer.html();
                textContainer.html("Please press a key... Esc to cancel")

                that.controls_set($(this).attr("data-command"), function(control)
                {
                    // text
                    if (control != null)
                    {
                        textContainer.html(that.controls_format(control));
                    }
                    else
                    {
                        textContainer.html(tmp);
                    }

                    // unblock buttons
                    $("button", $(that2).parent().parent().siblings().andSelf()).prop("disabled", false);
                });
            });

            // update axes
            loop_function = function()
            {
                that.controls_gamepad_poll(true);

                // gamepad changed?
                if (that.controls.gamepad.axes.length != $("div#controls-gamepad-move div", container).length)
                {
                    // create dom
                    $("div#controls-gamepad-move", container).html("");
                    $.each(that.controls.gamepad.axes, function(index, axes)
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
                    if (that.controls.gamepad.axes_selected > that.controls.gamepad.axes.length - 1)
                    {
                        that.controls.gamepad.axes_selected = 0;
                    }
                    $("div#controls-gamepad-move div:nth-child(" + (that.controls.gamepad.axes_selected + 1) + ") label input", container).prop("checked", true);
                }

                // update progress bars
                $.each(that.controls.gamepad.axes, function(index, axes)
                {
                    var bars = $("div#controls-gamepad-move div:nth-child(" + (index + 1) + ") progress", container);
                    bars.first().val(axes.x + 1);
                    bars.last().val(axes.y + 1);
                });
            };
            break;
        case "options":    
            // controls
            this.controls_command_set("up", function()
            {
                var selected = $("table tr.selected", container);
                if (selected.prevAll().length > 0)
                {
                    selected.removeClass("selected");
                    selected.prev().addClass("selected");
                }
            });

            this.controls_command_set("down", function()
            {
                var selected = $("table tr.selected", container);
                if (selected.nextAll().length > 0)
                {
                    selected.removeClass("selected");
                    selected.next().addClass("selected");
                }
            });

            this.controls_command_set("enter", function()
            {
                var td = $("table tr.selected td:nth-child(2)", container);
                var checkbox = $("input[type=checkbox]", td);
                if (checkbox.length == 1)
                {
                    checkbox.prop("checked", !checkbox.prop("checked"));
                }
            });

            this.controls_command_set("left", function()
            {
                var td = $("table tr.selected td:nth-child(2)", container);

                // radio
                var radio = $("input[type=radio]:checked", td);
                if (radio.length == 1 &&
                    radio.parent("label").prev().length == 1)
                {
                    radio.prop("checked", false);
                    radio.parent("label").prev().children("input[type=radio]").prop("checked", true);
                }           

                // range
                var range = $("input[type=range]", td);
                if (range.length == 1)
                {
                    var step = 1;
                    if (range.attr("step"))
                    {
                        step = parseInt(range.attr("step"));
                    }
                    range.val(parseInt(range.val()) - step);
                }
            });

            this.controls_command_set("right", function()
            {
                var td = $("table tr.selected td:nth-child(2)", container);

                // radio
                var radio = $("input[type=radio]:checked", td);
                if (radio.length == 1 &&
                    radio.parent("label").next().length == 1)
                {
                    radio.prop("checked", false);
                    radio.parent("label").next().children("input[type=radio]").prop("checked", true);
                }

                // range
                var range = $("input[type=range]", td);
                if (range.length == 1)
                {
                    var step = 1;
                    if (range.attr("step"))
                    {
                        step = parseInt(range.attr("step"));
                    }
                    range.val(parseInt(range.val()) + step);
                }
            });


            $("table tr:nth-child(1)", container).addClass("selected");

            // style
            $.each($("input[data-option=style]"), function()
            {
                $(this).attr("checked", that.options.style == $(this).val());
            });

            // music
            $("input#options-music-mute")
                .attr("checked", this.audio.music.mute);

            $("input#options-music-volume")
                .attr("max", this.audio.max)
                .val(this.audio.music.volume);

            // sfx
            $("input#options-sfx-mute")
                .attr("checked", this.audio.sfx.mute);

            $("input#options-sfx-volume")
                .attr("max", this.audio.max)
                .val(this.audio.sfx.volume);

            // loop
            loop_function = function()
            {
                that.controls_gamepad_poll(false);
            };
            break;
        case "about":
            // loop
            loop_function = function()
            {
                that.controls_gamepad_poll(false);
            };
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

    // start loop
    if (loop_function != null)
    {            
        var loop = function()
        {
            loop_function();

            // next update
            if (container.is(":visible"))
            {
                window.requestAnimationFrame(loop);   
            }
        }
        window.setTimeout(function() { window.requestAnimationFrame(loop); }, 500); // start getting visible
    }
}