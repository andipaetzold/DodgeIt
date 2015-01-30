var Screen = (function()
{
    // SCREENS
    var screens = {
        "menu": (function()
        {
            // INIT
            var container = $("div#menu", DodgeIt.container);

            $("span", container).hover(function()
            {
                $(this).siblings().removeClass("selected");
                $(this).addClass("selected");
            });

            $("span", container).click(function()
            {
                Screen.show($(this).attr("data-screen"));
            });

            $("span:first", container).addClass("selected");
            
            // FUNCTIONS
            var showBefore = function()
            {
                Controls.command("enter").set(function()
                {
                    $("span.selected", container).click();
                });

                Controls.command("up").set(function()
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

                    // sfx
                    Audio.sfx.play("change");
                });

                Controls.command("down").set(function()
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

                    // sfx
                    Audio.sfx.play("change");
                });
            };

            var showAfter = function()
            {

            };

            var loop = function()
            {
                Controls.gamepad.poll(false);
            };

            // RETURN
            return {
                container:  container,
                showBefore: showBefore,
                showAfter:  showAfter,
                loop:       loop
            };
        })(),

        "gameplay": (function()
        {
            // INIT
            var container = $("div#gameplay", DodgeIt.container);
            
            // FUNCTIONS
            var showBefore = function()
            {
                // controls
                Controls.command("back").set(function()
                {
                    Gameplay.pause();
                });

                DodgeIt.container.click(function()
                {
                    Gameplay.pause();
                });

                // init
                Gameplay.init();
            };

            var showAfter = function()
            {
                Gameplay.start();
            };

            var loop = function()
            {
                Controls.gamepad.poll(false);
            };

            // RETURN
            return {
                container:  container,
                showBefore: showBefore,
                showAfter:  showAfter,
                loop:       loop
            };
        })(),

        "leaderboard": (function()
        {
            // INIT
            var container = $("div#leaderboard", DodgeIt.container);
            
            // back
            $("span.back", container).click(function()
            {
                Screen.show("menu");
            });
            
            // FUNCTIONS
            var showBefore = function()
            {
                // back
                Controls.command("back").set(function()
                {
                    Screen.show("menu");

                    // sfx
                    Audio.sfx.play("change");
                });

                // load
                Leaderboard.get(0, 10, $("table", container));
            };

            var showAfter = function() { };

            var loop = function()
            {
                Controls.gamepad.poll(false);
            };

            // RETURN
            return {
                container:  container,
                showBefore: showBefore,
                showAfter:  showAfter,
                loop:       loop
            };
        })(),

        "gameplay-gameover": (function()
        {
            // INIT
            var container = $("div#gameplay-gameover", DodgeIt.container);
            
            // hover 
            $("table", container).delegate("td", "mouseover", function(v)
            {
                $("table tr td", container).removeClass("selected");
                $(this).addClass("selected");
            });

            // click
            $("table", container).delegate("td", "click", function()
            {
                var input = $("input[type=text]", container);
                switch ($(this).attr("data-action"))
                {
                    case "add":
                        if (input.prop("maxlength") > input.val().length)
                        {
                            input.val(input.val() + $(this).attr("data-symbol" + ($("td[data-action=shift]", container).attr("data-pressed") == "true" ? "1" : "2") ));
                        }
                        break;
                    case "shift":
                        // change pressed-state
                        var pressed = $(this).attr("data-pressed");
                        pressed = (pressed == "true" ? "false" : "true");
                        $(this).attr("data-pressed", pressed);

                        var symbols = $("table tr td[data-action=add]", container);
                        $.each(symbols, function(index, symbol)
                        {
                            symbol = $(symbol);
                            if (pressed == "true")
                            {
                                symbol.html(symbol.html().toUpperCase());
                            }
                            else
                            {
                                symbol.html(symbol.html().toLowerCase());
                            }
                        });
                        break;
                    case "delete":
                        input.val(input.val().slice(0, -1));
                        break;
                    case "cancel":
                        Screen.show("gameplay-restart");
                        break;
                    case "submit":
                        Leaderboard.post(input.val(), $("span.score", container).html());
                        DodgeIt.options.name = input.val(); DodgeIt.save();
                        Screen.show("gameplay-restart");
                        break;
                    default:
                        break;
                }
            });

            var showBefore = function(args)
            {
                // controls
                Controls.command("up").set(function()
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

                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("down").set(function()
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

                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("left").set(function()
                {
                    var selected = $("table tr td.selected", container);
                    if (selected.prevAll().length > 0)
                    {
                        selected.removeClass("selected");
                        selected.prev().addClass("selected");

                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("right").set(function()
                {
                    var selected = $("table tr td.selected", container);
                    if (selected.nextAll().length > 0)
                    {
                        selected.removeClass("selected");
                        selected.next().addClass("selected");                        

                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("enter").set(function()
                {
                    $("table tr td.selected", container).click();
                });

                Controls.command("back").set(function()
                {
                    var input = $("input[type=text]", container);
                    input.val(input.val().slice(0, -1));
                });

                // select first
                $("table tr td.selected", container).removeClass("selected");
                $("table tr:nth-child(1) td:nth-child(1)", container).addClass("selected");

                // set score
                $("span.score", container).html(args);

                // set name
                $("input[type=text]", container).val(DodgeIt.options.name);
            };

            var showAfter = function()
            {

            };

            var loop = function()
            {
                Controls.gamepad.poll(false);
            };

            // RETURN
            return {
                container:  container,
                showBefore: showBefore,
                showAfter:  showAfter,
                loop:       loop
            };
        })(),

        "gameplay-restart": (function()
        {
            // INIT
            var container = $("div#gameplay-restart", DodgeIt.container);
            
            $("div span:nth-child(1)", container).click(function(event)
            {
                Screen.show("gameplay");
            });
            $("div span:nth-child(2)", container).click(function(event)
            {
                Screen.show("menu");
            });

            $("div span", container).hover(function()
            {   
                $(this).siblings().removeClass("selected");
                $(this).addClass("selected");
            });

            // back
            $("span.back", container).click(function()
            {
                Screen.show("menu");
            });
            
            // FUNCTIONS
            var showBefore = function()
            {
                Controls.command("left").set(function()
                {
                    if (!$("div span:nth-child(1)", container).hasClass("selected"))
                    {
                        $("div span:nth-child(1)", container).addClass("selected");
                        $("div span:nth-child(2)", container).removeClass("selected");

                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("right").set(function()
                {
                    if (!$("div span:nth-child(2)", container).hasClass("selected"))
                    {
                        $("div span:nth-child(1)", container).removeClass("selected");
                        $("div span:nth-child(2)", container).addClass("selected");
                        
                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("enter").set(function()
                {
                    $("div span.selected", container).click();
                });

                // select Yes
                $("div span:nth-child(1)", container).addClass("selected");
                $("div span:nth-child(2)", container).removeClass("selected");
            };

            var showAfter = function()
            {

            };

            var loop = function()
            {
                Controls.gamepad.poll(false);
            };

            // RETURN
            return {
                container:  container,
                showBefore: showBefore,
                showAfter:  showAfter,
                loop:       loop
            };
        })(),

        "controls": (function()
        {
            // INIT
            var container = $("div#controls", DodgeIt.container);
            
            // gamepad
            if (!Controls.options.gamepad.available)
            {
                $("tr[data-control=gamepad]", container).hide();   
            }

            // orientation
            if (!Controls.options.orientation.available)
            {
                $("tr[data-control=orientation]", container).hide();    
            }

            // back
            $("span.back", container).click(function()
            {
                Screen.show("menu");
            });
            
            // FUNCTIONS
            var showBefore = function()
            {
                Controls.command("back").set(function()
                {
                    Screen.show("menu");
                });

                // poll gamepad
                Controls.gamepad.poll(true);

                // set keys
                $.each($("span[data-command]", container), function()
                {
                    $(this).html(Controls.format(Controls.options.command[$(this).attr("data-command")]));
                });

                // set change action
                var that = this;
                $("tr[data-option=command] td button", container).click(function()
                {
                    // block buttons
                    $("button", $(this).parent().parent().siblings().andSelf()).prop("disabled", true);

                    // text
                    var textContainer = $("span[data-command=" + $(this).attr("data-command") + "]");
                    var tmp = textContainer.html();
                    textContainer.html("Please press a key... Esc to cancel")

                    Controls.set($(this).attr("data-command"), function(control)
                    {
                        // text
                        if (control != null)
                        {
                            textContainer.html(Controls.format(control));
                        }
                        else
                        {
                            textContainer.html(tmp);
                        }

                        // unblock buttons
                        $("button", container).prop("disabled", false);
                    });
                });
            };

            var showAfter = function() { };

            var loop = function()
            {
                var that = this;

                // gamepad
                if (Controls.options.gamepad.available)
                {
                    Controls.gamepad.poll(true);
                    
                    if (Controls.options.gamepad.axes.length != $("tr[data-control=gamepad] td:nth-child(2) label", container).length)
                    {
                        // create dom
                        $("tr[data-control=gamepad] td:nth-child(2)", container).html("");

                        $.each(Controls.options.gamepad.axes, function(index, axes)
                        {
                            $("tr[data-control=gamepad] td:nth-child(2)", that.container).append(
                                $("<label></label>")
                                    .append(
                                        $("<input>")
                                            .attr("type", "radio")
                                            .attr("name", "controls-gamepad-move")
                                            .change(function(event)
                                            {
                                                Controls.options.gamepad.axes_selected = $(this).parent().parent().prevAll().length;
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
                        if (Controls.options.gamepad.axes_selected > Controls.options.gamepad.axes.length - 1)
                        {
                            Controls.options.gamepad.axes_selected = 0;
                        }
                        $("tr[data-control=gamepad] td:nth-child(2) label:nth-child(" + (Controls.options.gamepad.axes_selected + 1) + ") input[type=radio]", that.container).prop("checked", true);
                    }


                    // update progress bars
                    $.each(Controls.options.gamepad.axes, function(index, axes)
                    {
                        $("tr[data-control=gamepad] td:nth-child(2) label:nth-child(" + (index + 1) + ") progress:nth-child(2)", that.container).val(axes.x + 1);
                        $("tr[data-control=gamepad] td:nth-child(2) label:nth-child(" + (index + 1) + ") progress:nth-child(3)", that.container).val(axes.y + 1);
                    });
                }

                // mobile device orientation
                if (Controls.options.orientation.available)
                {
                    $("progress[data-control=orientation]:nth-child(1)", that.container).val(Controls.orientation.axes().x * 30 + 30);
                    $("progress[data-control=orientation]:nth-child(2)", that.container).val(Controls.orientation.axes().y * 30 + 30);
                }
            };

            // RETURN
            return {
                container:  container,
                showBefore: showBefore,
                showAfter:  showAfter,
                loop:       loop
            };
        })(),

        "options": (function()
        {
            // INIT
            var container = $("div#options", DodgeIt.container);
            
            $("tbody tr", container).hover(function()
            {
                $(this).siblings().removeClass("selected");
                $(this).addClass("selected");
            });

            $("input", container).on("change mousemove", function()
            {
                // style
                DodgeIt.options.style = $("input[data-option=style]:checked", container).val();

                // music
                Audio.music.options.mute   = $("input[data-option=music-mute]", container).prop("checked");
                Audio.music.options.volume = $("input[data-option=music-volume]", container).val();

                // sfx
                Audio.sfx.options.mute     = $("input[data-option=sfx-mute]", container).prop("checked");
                Audio.sfx.options.volume   = $("input[data-option=sfx-volume]", container).val();

                // speed
                DodgeIt.options.speed = $("input[data-option=speed]", container).val(); 

                // save 
                DodgeIt.save(); 
            });

            $("input[data-option=fullscreen]", container).change(function()
            {
                if (screenfull.enabled)
                {
                    if ($("input[data-option=fullscreen]", container).prop("checked"))
                    {
                        screenfull.request();
                    }
                    else
                    {
                        screenfull.exit();
                    }
                }
            });

            // back
            $("span.back", container).click(function()
            {
                Screen.show("menu");
            });
            
            // FUNCTIONS
            var showBefore = function()
            {
                // controls
                Controls.command("up").set(function()
                {
                    var selected = $("table tr.selected", container);
                    if (selected.prevAll().length > 0)
                    {
                        selected.removeClass("selected");
                        selected.prev().addClass("selected");
                        
                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("down").set(function()
                {
                    var selected = $("table tr.selected", container);
                    if (selected.nextAll().length > 0)
                    {
                        selected.removeClass("selected");
                        selected.next().addClass("selected");
                        
                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("enter").set(function()
                {
                    var checkbox = $("table tr.selected input[type=checkbox]", container);
                    if (checkbox.length == 1)
                    {
                        checkbox
                            .prop("checked", !checkbox.prop("checked"))
                            .trigger("change");
                    }
                });

                Controls.command("left").set(function()
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
                        
                        // sfx
                        Audio.sfx.play("change");
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
                            .trigger("change");
                        
                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("right").set(function()
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
                            .trigger("change");
                        
                        // sfx
                        Audio.sfx.play("change");
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
                            .trigger("change");
                        
                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                Controls.command("back").set(function()
                {
                    Screen.show("menu");
                });


                $("table tr:nth-child(1)", container).addClass("selected");

                // style
                $("input[value=" + DodgeIt.options.style + "]", container).prop("checked", true);

                // music
                $("input[data-option=music-mute]", container).prop("checked", Audio.music.options.mute);
                $("input[data-option=music-volume]", container).val(Audio.music.options.volume);

                // sfx
                $("input[data-option=sfx-mute]", container).prop("checked", Audio.sfx.options.mute);
                $("input[data-option=sfx-volume]", container).val(Audio.sfx.options.volume);

                // speed
                $("input[data-option=speed]", container).val(DodgeIt.options.speed);
            };

            var showAfter = function() { };

            var loop = function()
            {
                Controls.gamepad.poll(false);
            };

            // RETURN
            return {
                container:  container,
                showBefore: showBefore,
                showAfter:  showAfter,
                loop:       loop
            };
        })(),

        "about": (function()
        {
            // INIT
            // container
            var container = $("div#about", DodgeIt.container);
            
            // back
            $("span.back", container).click(function()
            {
                Screen.show("menu");
            });

            // FUNCTIONS
            var showBefore = function()
            {
                Controls.command("back").set(function()
                {
                    Screen.show("menu");
                });
            };

            var showAfter = function() { };
            var loop = function()
            {
                Controls.gamepad.poll(false);
            };

            // RETURN
            return {
                container:  container,
                showBefore: showBefore,
                showAfter:  showAfter,
                loop:       loop
            };
        })()
    };

    // FUNCTIONS
    var show = function(screen, args)
    {
        // reset keys
        Controls.reset();

        // get screen
        screen = screens[screen];

        // show before
        screen.showBefore(args);

        // show screen
        if (screen.container.siblings(":visible").length > 0)
        {
            screen.container.siblings(":visible").fadeOut(250, function()
            {
                screen.container.fadeIn(250);
            });
        }
        else
        {
            screen.container.show();
        }

        // loop
        if (screen.loop)
        {
            var loop = function()
            {
                var again = screen.loop();
                if (again == undefined) again = true;

                // next update
                if (screen.container.is(":visible") &&
                    again)
                {
                    window.requestAnimationFrame(loop);
                }
            }

            window.setTimeout(function() { window.requestAnimationFrame(loop); }, 500); // start getting visible
        }

        // show after
        screen.showAfter(args);
    };

    // INIT
    show("menu");

    // RETURN
    return {
        show:   show
    };
})();