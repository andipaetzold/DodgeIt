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
        $("table tr td", container["gameplay-gameover"]).removeClass("selected");
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
                that.screen_show("gameplay-restart");
                break;
            case "submit":
                that.leaderboard.post(input.val(), $("span.score", container["gameplay-gameover"]).html());
                that.options.name = input.val(); that.save();
                that.screen_show("gameplay-restart");
                break;
            default:
                break;
        }
    });

    // gameplay-restart
    $("div span:nth-child(1)", container["gameplay-restart"]).click(function(event)
    {
        that.screen_show("gameplay");
    });
    $("div span:nth-child(2)", container["gameplay-restart"]).click(function(event)
    {
        that.screen_show("menu");
    });

    $("div span", container["gameplay-restart"]).hover(function()
    {   
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
    });

    // leaderboard

    // controls
    if (!that.controls.gamepad.available)
    {
        $("tr[data-control=gamepad]").hide();   
    }

    if (!that.controls.orientation.available)
    {
        $("tr[data-control=orientation]").hide();    
    }

    // options
    $("tbody tr", container["options"]).hover(function()
    {
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
    });

    $("input", container["options"]).on("change mousemove", function()
    {
        // style
        that.options.style      = $("input[data-option=style]:checked", container["options"]).val();

        // music
        that.audio.music.mute   = $("input[data-option=music-mute]", container["options"]).prop("checked");
        that.audio.music.volume = $("input[data-option=music-volume]", container["options"]).val();

        // sfx
        that.audio.sfx.mute     = $("input[data-option=sfx-mute]", container["options"]).prop("checked");
        that.audio.sfx.volume   = $("input[data-option=sfx-volume]", container["options"]).val();

        // speed
        that.options.speed      = $("input[data-option=speed]", container["options"]).val(); 

        // save 
        that.save(); 
    });

    $("input[data-option=fullscreen]", container["options"]).change(function()
    {
        if (screenfull.enabled)
        {
            if ($("input[data-option=fullscreen]", container["options"]).prop("checked"))
            {
                screenfull.request();
            }
            else
            {
                screenfull.exit();
            }
        }
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
            $("input[type=text]", container).val(that.options.name);
            
            // loop
            loop_function = function()
            {
                that.controls_gamepad_poll(false);
            };
            break;
        case "gameplay-restart":
            this.controls_command_set("left", function()
            {
                $("div span:nth-child(1)", container).addClass("selected");
                $("div span:nth-child(2)", container).removeClass("selected");
            });

            this.controls_command_set("right", function()
            {
                $("div span:nth-child(1)", container).removeClass("selected");
                $("div span:nth-child(2)", container).addClass("selected");
            });

            this.controls_command_set("enter", function()
            {
                $("div span.selected", container).click();
            });

            // select Yes
            $("div span:nth-child(1)", container).addClass("selected");
            $("div span:nth-child(2)", container).removeClass("selected");

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
            $("tr[data-option=command] td button", container).click(function()
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
                // gamepad
                if (that.controls.gamepad.available)
                {
                    that.controls_gamepad_poll(true);
                    
                    if (that.controls.gamepad.axes.length != $("tr[data-control=gamepad] td:nth-child(2) label", container).length)
                    {
                        // create dom
                        $("tr[data-control=gamepad] td:nth-child(2)", container).html("");
                        $.each(that.controls.gamepad.axes, function(index, axes)
                        {
                            $("tr[data-control=gamepad] td:nth-child(2)", container).append(
                                $("<label></label>")
                                    .append(
                                        $("<input>")
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
                            );
                        });

                        // select
                        if (that.controls.gamepad.axes_selected > that.controls.gamepad.axes.length - 1)
                        {
                            that.controls.gamepad.axes_selected = 0;
                        }
                        $("tr[data-control=gamepad] td:nth-child(2) label:nth-child(" + (that.controls.gamepad.axes_selected + 1) + ") input[type=radio]", container).prop("checked", true);
                    }


                    // update progress bars
                    $.each(that.controls.gamepad.axes, function(index, axes)
                    {
                        $("tr[data-control=gamepad] td:nth-child(2) label:nth-child(" + (index + 1) + ") progress:nth-child(1)", container).val(axes.x + 1);
                        $("tr[data-control=gamepad] td:nth-child(2) label:nth-child(" + (index + 1) + ") progress:nth-child(2)", container).val(axes.y + 1);
                    });
                }

                // mobile device orientation
                if (that.controls.orientation.available)
                {
                    $("progress[data-control=orientation]:nth-child(1)", container).val(that.controls.orientation.beta  + 30);
                    $("progress[data-control=orientation]:nth-child(2)", container).val(that.controls.orientation.gamma + 30);
                }
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
                var checkbox = $("table tr.selected input[type=checkbox]", container);
                if (checkbox.length == 1)
                {
                    checkbox
                        .prop("checked", !checkbox.prop("checked"))
                        .trigger("change");
                }
            });

            this.controls_command_set("left", function()
            {
                var tr = $("table tr.selected", container);

                // radio
                var radio = $("input[type=radio]:checked", tr);
                if (radio.length == 1 &&
                    radio.parent("label").prev().length == 1)
                {
                    radio.prop("checked", false);
                    radio.parent("label").prev().children("input[type=radio]")
                        .prop("checked", true)
                        .trigger("change");
                }           

                // range
                var range = $("input[type=range]", tr);
                if (range.length == 1)
                {
                    var step = 1;
                    if (range.attr("step"))
                    {
                        step = parseFloat(range.attr("step"));
                    }
                    range
                        .val(parseFloat(range.val()) - step)
                        .trigger("change");;
                }
            });

            this.controls_command_set("right", function()
            {
                var tr = $("table tr.selected", container);

                // radio
                var radio = $("input[type=radio]:checked", tr);
                if (radio.length == 1 &&
                    radio.parent("label").next().length == 1)
                {
                    radio.prop("checked", false);
                    radio.parent("label").next().children("input[type=radio]")
                        .prop("checked", true)
                        .trigger("change");;
                }

                // range
                var range = $("input[type=range]", tr);
                if (range.length == 1)
                {
                    var step = 1;
                    if (range.attr("step"))
                    {
                        step = parseFloat(range.attr("step"));
                    }
                    range
                        .val(parseFloat(range.val()) + step)
                        .trigger("change");;
                }
            });


            $("table tr:nth-child(1)", container).addClass("selected");

            // style
            $("input[value=" + that.options.style + "]", container["options"]).prop("checked", true);

            // music
            $("input[data-option=music-mute]", container["options"]).prop("checked", that.audio.music.mute);
            $("input[data-option=music-volume]", container["options"]).val(that.audio.music.volume);

            // sfx
            $("input[data-option=sfx-mute]", container["options"]).prop("checked", that.audio.sfx.mute);
            $("input[data-option=sfx-volume]", container["options"]).val(that.audio.sfx.volume);

            // speed
            $("input[data-option=speed]", container["options"]).val(that.options.speed); 

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