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

                // sfx
                Audio.sfx.play("change");
            });
            
            // FUNCTIONS
            var showBefore = function() {};

            var showAfter = function()
            {
                // enter
                Controls.command("enter").set(function()
                {
                    $("span.selected", container).click();
                });

                // up
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

                // down
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

                // sfx
                Audio.sfx.play("change");
            });
            
            // FUNCTIONS
            var showBefore = function()
            {
                // loading
                $("table", container)
                    .empty()
                    .append(
                        $("<tr></tr>")
                            .addClass("loading")
                            .append(
                                $("<td></td>")
                                    .attr("colspan", 3)
                                    .html("Loading...")
                            )
                        );

                // load
                Leaderboard.get(function(data)
                {
                    var start = 0;
                    var count = 10;
                    var table = $("table", container);

                    var load = function()
                    {
                        // clear table
                        table.empty();

                        // filter items
                        var output = data.slice(start, start + count);

                        // print table
                        $.each(output, function(index, value)
                        {
                            $("<tr></tr>")
                                .appendTo(table)
                                .append($("<td></td>").html(start + index + 1))
                                .append($("<td></td>").html(value.name))
                                .append($("<td></td>").html(value.score));                       
                        });

                        // prev button
                        if (start == 0)
                        {
                            $("div span:first-child", container).hide();
                        }
                        else
                        {
                            $("div span:first-child", container).show();
                        }

                        // next button
                        if (data.length <= start + count)
                        {
                            $("div span:last-child", container).hide();
                        }
                        else
                        {
                            $("div span:last-child", container).show();
                        }
                    };

                    // prev button
                    $("div span:first-child", container)
                        .unbind("click")
                        .click(function()
                    {
                        start -= count;
                        load();            

                        // sfx
                        Audio.sfx.play("change");
                    });

                    // next button
                    $("div span:last-child", container)
                        .unbind("click")
                        .click(function()
                    {
                        start += count;
                        load();            

                        // sfx
                        Audio.sfx.play("change");
                    });

                    // load
                    load();
                });
            };

            var showAfter = function()
            {
                // back
                Controls.command("back").set(function()
                {
                    Screen.show("menu");

                    // sfx
                    Audio.sfx.play("change");
                });

                // up
                Controls.command("up").set(function()
                {
                    if ($("div span:first-child", container).is(":visible"))
                    {
                        $("div span:first-child", container).click();
                    }
                });

                // down
                Controls.command("down").set(function()
                {
                    if ($("div span:last-child", container).is(":visible"))
                    {
                        $("div span:last-child", container).click();
                    }
                });

                // left
                Controls.command("left").set(function()
                {
                    if ($("div span:first-child", container).is(":visible"))
                    {
                        $("div span:first-child", container).click();
                    }
                });

                // right
                Controls.command("right").set(function()
                {
                    if ($("div span:last-child", container).is(":visible"))
                    {
                        $("div span:last-child", container).click();
                    }
                });
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

        "gameplay-gameover": (function()
        {
            // INIT
            var container = $("div#gameplay-gameover", DodgeIt.container);
            
            // hover 
            $("table", container).delegate("td", "mouseover", function(v)
            {
                $("table tr td", container).removeClass("selected");
                $(this).addClass("selected");

                // sfx
                Audio.sfx.play("change");
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

                // sfx
                Audio.sfx.play("change");
            });

            var showBefore = function(args)
            {
                // set score
                $("span.score", container).html(args);

                // set name
                $("input[type=text]", container).val(DodgeIt.options.name);
            };

            var showAfter = function()
            {
                // up
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

                // down
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

                // left
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

                // right
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

                // enter
                Controls.command("enter").set(function()
                {
                    $("table tr td.selected", container).click();
                });

                // back
                Controls.command("back").set(function()
                {
                    var input = $("input[type=text]", container);
                    input.val(input.val().slice(0, -1));
                });
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

                // sfx
                Audio.sfx.play("change");
            });
            $("div span:nth-child(2)", container).click(function(event)
            {
                Screen.show("menu");
                
                // sfx
                Audio.sfx.play("change");
            });

            $("div span", container).hover(function()
            {   
                $(this).siblings().removeClass("selected");
                $(this).addClass("selected");
            });
            
            // FUNCTIONS
            var showBefore = function() {};

            var showAfter = function()
            {
                // left
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

                // right
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

                // enter
                Controls.command("enter").set(function()
                {
                    $("div span.selected", container).click();
                });
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
            
            // hover
            $("table tr", container).hover(function()
            {
                $(this).siblings().removeClass("selected");
                $(this).addClass("selected");
            });
            
            // gamepad
            if (!Controls.gamepad.available)
            {
                $("table tr[data-control=gamepad]", container).hide();
            }

            // orientation
            if (!Controls.orientation.available)
            {
                $("table tr[data-control=orientation]", container).hide();    
            }

            // back
            $("span.back", container).click(function()
            {
                Screen.show("menu");
                
                // sfx
                Audio.sfx.play("change");
            });

            // set change action
            $("table tr[data-control=command]", container).click(function()
            {
                if ($(this).hasClass("disabled")) return;

                // disable rest
                $("tr", container).addClass("disabled");

                // text
                var textContainer = $("td:nth-child(2)", this);
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

                    // reenable
                    $("tr", container).removeClass("disabled");

                    // sfx
                    Audio.sfx.play("change");
                });            

                // sfx
                Audio.sfx.play("change");
            });
            
            // FUNCTIONS
            var showBefore = function()
            {
                // poll gamepad
                Controls.gamepad.poll(true);

                // set keys
                $.each($("tr[data-command]", container), function()
                {
                    $("td:nth-child(2)", this).html(Controls.format(DodgeIt.options.controls[$(this).attr("data-command")]));
                });

                // select first item
                $("table tr", container).removeClass("selected");
                $("table tr:nth-child(1)", container).addClass("selected");
            };

            var showAfter = function()
            {
                // back
                Controls.command("back").set(function()
                {
                    Screen.show("menu");
                
                    // sfx
                    Audio.sfx.play("change");
                });

                // up
                Controls.command("up").set(function()
                {
                    var selected = $("table tr.selected", container);
                    if (selected.prevAll().length > 0 &&
                        selected.prev().is(":visible"))
                    {
                        selected.removeClass("selected");
                        selected.prev().addClass("selected");
                        
                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                // down
                Controls.command("down").set(function()
                {
                    var selected = $("table tr.selected", container);
                    if (selected.nextAll().length > 0 &&
                        selected.next().is(":visible"))
                    {
                        selected.removeClass("selected");
                        selected.next().addClass("selected");
                        
                        // sfx
                        Audio.sfx.play("change");
                    }
                });

                // enter
                Controls.command("enter").set(function()
                {
                    var selected = $("table tr.selected", container);
                    if (selected.attr("data-control") == "command")
                    {
                        selected.click();
                    }
                    else if (selected.attr("data-control") == "gamepad")
                    {
                        var selected_radio = $("td:nth-child(2) label input[type=radio]:checked", selected);
                        if (selected_radio.parent().nextAll().length > 0)
                        {
                            $("input[type=radio]", selected_radio.parent().next()).prop("checked", true);
                        }
                        else
                        {
                            $("input[type=radio]", selected_radio.parent().prevAll().last()).prop("checked", true);
                        }
                    }
                });
            };

            var loop = function()
            {
                // gamepad
                if (Controls.gamepad.available)
                {
                    Controls.gamepad.poll(true);
                    
                    if (Controls.gamepad.axes_length() != $("tr[data-control=gamepad] td:nth-child(2) label", container).length)
                    {
                        // create dom
                        $("tr[data-control=gamepad] td:nth-child(2)", container).html("");

                        for (var i = 0; i <= Controls.gamepad.axes_length() - 1; i++)
                        {
                            var axes = Controls.gamepad.axes(i);
                            $("tr[data-control=gamepad] td:nth-child(2)", container).append(
                                $("<label></label>")
                                    .append(
                                        $("<input>")
                                            .attr("type", "radio")
                                            .attr("name", "controls-gamepad-move")
                                            .change(function(event)
                                            {
                                                DodgeIt.options.gamepad.axes_selected = $(this).parent().parent().prevAll().length;
                                                DodgeIt.save();
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
                        }

                        // select
                        if (DodgeIt.options.gamepad.axes_selected > Controls.gamepad.axes_length() - 1)
                        {
                            DodgeIt.options.gamepad.axes_selected = 0;
                        }
                        $("tr[data-control=gamepad] td:nth-child(2) label:nth-child(" + (DodgeIt.options.gamepad.axes_selected + 1) + ") input[type=radio]", container).prop("checked", true);
                    }
                    else
                    {
                        // update progress bars
                        for (var i = 0; i <= Controls.gamepad.axes_length() - 1; i++)
                        {
                            var axes = Controls.gamepad.axes(i);
                            $("tr[data-control=gamepad] td:nth-child(2) label:nth-child(" + (i + 1) + ") progress:nth-child(2)", container).val(axes.x + 1);
                            $("tr[data-control=gamepad] td:nth-child(2) label:nth-child(" + (i + 1) + ") progress:nth-child(3)", container).val(axes.y + 1);
                        }                        
                    }

                }

                // mobile device orientation
                if (Controls.orientation.available)
                {
                    $("progress[data-control=orientation]:nth-child(1)", container).val(Controls.orientation.axes().x * 30 + 30);
                    $("progress[data-control=orientation]:nth-child(2)", container).val(Controls.orientation.axes().y * 30 + 30);
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
                DodgeIt.options.music.mute   = $("input[data-option=music-mute]", container).prop("checked");
                DodgeIt.options.music.volume = $("input[data-option=music-volume]", container).val();

                // sfx
                DodgeIt.options.sfx.mute     = $("input[data-option=sfx-mute]", container).prop("checked");
                DodgeIt.options.sfx.volume   = $("input[data-option=sfx-volume]", container).val();

                // speed
                DodgeIt.options.speed = $("input[data-option=speed]", container).val(); 

                // save 
                DodgeIt.save(); 
            });

            $("input[data-option=fullscreen]", container).change(function()
            {                
                if ($("input[data-option=fullscreen]", container).prop("checked"))
                {
                    // enter fullscreen
                    if (screenfull.enabled)
                    {
                        screenfull.request();
                    }

                    // add margin
                    DodgeIt.container.addClass("fullscreen");
                }
                else
                {
                    // exit fullscreen
                    if (screenfull.enabled)
                    {
                        screenfull.exit();
                    }

                    // remove margin
                    DodgeIt.container.removeClass("fullscreen");
                }
            });

            // back
            $("span.back", container).click(function()
            {
                Screen.show("menu");                
                
                // sfx
                Audio.sfx.play("change");
            });

            // image click
            $("img", container).click(function()
            {
                if (!$(this).prev("input").prop("checked"))
                {
                    // sfx
                    Audio.sfx.play("change");
                }
            });

            // checkboxes click
            $("input[type=checkbox]", container).click(function()
            {
                // sfx
                Audio.sfx.play("change");
            });
            
            // FUNCTIONS
            var showBefore = function()
            {
                // style
                $("input[value=" + DodgeIt.options.style + "]", container).prop("checked", true);

                // music
                $("input[data-option=music-mute]", container).prop("checked", DodgeIt.options.music.mute);
                $("input[data-option=music-volume]", container).val(DodgeIt.options.music.volume);

                // sfx
                $("input[data-option=sfx-mute]", container).prop("checked", DodgeIt.options.sfx.mute);
                $("input[data-option=sfx-volume]", container).val(DodgeIt.options.sfx.volume);

                // speed
                $("input[data-option=speed]", container).val(DodgeIt.options.speed);
            };

            var showAfter = function()
            {
                // back
                Controls.command("back").set(function()
                {
                    Screen.show("menu");

                    // sfx
                    Audio.sfx.play("change");
                });

                // enter
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

                // up
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

                // down
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


                // left
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

                // right
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

        "about": (function()
        {
            // INIT
            // container
            var container = $("div#about", DodgeIt.container);
            
            // back
            $("span.back", container).click(function()
            {
                Screen.show("menu");                
                
                // sfx
                Audio.sfx.play("change");
            });

            // FUNCTIONS
            var showBefore = function() {};

            var showAfter = function()
            {
                Controls.command("back").set(function()
                {
                    Screen.show("menu");
                
                    // sfx
                    Audio.sfx.play("change");
                });
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
        })()
    };

    // FUNCTIONS
    var show = function(screen, args)
    {
        var after = function()
        {
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
                screen.container.fadeIn(250, after);
            });
        }
        else
        {
            screen.container.show();
            after();
        }
    };

    // INIT
    show("menu");

    // RETURN
    return {
        show:   show
    };
})();