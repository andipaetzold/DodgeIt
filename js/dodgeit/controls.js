var Controls = (function()
{
    var options = {
        command: {
            "up": {
                fn:         function() {},
                pressed:    false
            },
            "down": {
                fn:         function() {},
                pressed:    false
            },
            "left": {
                fn:         function() {},
                pressed:    false
            },
            "right":  {
                fn:         function() {},
                pressed:    false
            },
            "enter": {
                fn:         function() {},
                pressed:    false
            },
            "back":  {
                fn:         function() {},
                pressed:    false
            }
        },
        gamepad: {
            buttons:    [],
            axes:       [],

            timestamp:  0
        },

        orientation: {
            beta:       null,
            gamma:      null
        },

        set: {
            active:     false,
            key:        "",
            abort:      {
                // Escape
                device: "keyboard",
                type:   null,
                code:   27
            },
            callback:   null
        }
    };

    // FUNCTIONS
    var command = function(command)
    {
        command = options.command[command];

        var set = function(fn)
        {
            command.fn = fn;
        };

        return {
            call:   command.fn,
            set:    set,

            pressed: command.pressed
        };
    };

    var ondown = function(control)
    {
        var toReturn = true;
        if (!options.set.active)
        {
            $.each(DodgeIt.options.controls, function(index, command)
            {
                if (command.device == control.device &&
                    command.type   == control.type &&
                    command.code   == control.code)
                {
                    options.command[index].pressed = true;
                    options.command[index].fn();
                    toReturn = false;
                    return false;
                }
            });
        }
        else
        {
            // set control
            if (options.set.abort.device != control.device ||
                options.set.abort.type   != control.type ||
                options.set.abort.code   != control.code)
            {
                DodgeIt.options.controls[options.set.key].device = control.device;
                DodgeIt.options.controls[options.set.key].type   = control.type;
                DodgeIt.options.controls[options.set.key].code   = control.code;
                DodgeIt.save();
                options.set.callback(control);
            }
            else
            {
                options.set.callback(null);
            }
            options.set.active = false;

            toReturn = false;
        }
        return toReturn;
    };

    var onup = function(control)
    {
        var toReturn = true;
        $.each(DodgeIt.options.controls, function(index, command)
        {
            if (command.device == control.device &&
                command.type   == control.type &&
                command.code   == control.code)
            {
                options.command[index].pressed = false;
                toReturn = false;
                return false;
            }
        });

        return toReturn;
    };

    var format = function(control)
    {
        if (control.device == "keyboard")
        {
            var keycodes = {
                 37:    "Arrow Left",
                 38:    "Arrow Up",
                 39:    "Arrow Right",
                 40:    "Arrow Down",
                 45:    "Insert",
                 46:    "Delete",
                  8:    "Backspace",
                  9:    "Tab",
                 13:    "Enter",
                 16:    "Shift",
                 17:    "Ctrl",
                 18:    "Alt",
                 19:    "Pause",
                 20:    "Caps Lock",
                 27:    "Escape",
                 32:    "Space",
                 33:    "Page Up",
                 34:    "Page Down",
                 35:    "End",
                 36:    "Home",
                112:    "F1",
                113:    "F2",
                114:    "F3",
                115:    "F4",
                116:    "F5",
                117:    "F6",
                118:    "F7",
                119:    "F8",
                120:    "F9",
                121:    "F10",
                122:    "F11",
                123:    "F12",
                144:    "Num Lock",
                145:    "Scroll Lock",
                186:    "Semicolon",
                187:    "Equal",
                188:    "Comma",
                189:    "Dash",
                190:    "Period",
                191:    "Slash",
                192:    "Grave Accent",
                219:    "Open Bracket",
                220:    "Backslash",
                221:    "Close Braket",
                222:    "Single Quote"
            };

            if (control.code >= 48 && control.code <= 90)
            {
                return "Keyboard " + String.fromCharCode(control.code).toLowerCase();   
            } 
            else
            {
                return "Keyboard " + keycodes[control.code];
            }
        }
        else if (control.device == "gamepad" &&
                 control.type   == "button")
        {
            return "Gamepad Button " + control.code;
        }
        else if (control.device == "gamepad" &&
                 control.type.match(/axes-\d/))
        {
            return "Gamepad Axes " + control.code;
        }
        else
        {
            return "";
        }
    };

    var set = function(key, callback)
    {
        options.set.key = key;
        options.set.callback = callback;
        options.set.active = true;   
    };

    var reset = function()
    {
        var that = this;
        $.each(options.command, function(index, value)
        {
            that.command(index).set(function() {});
        });        
    };

    // gamepad
    var gamepad_axes = function(axis)
    {
        // set axis
        if (axis == undefined)
        {
            axis = DodgeIt.options.gamepad.axes_selected;
        }

        // check if valid
        if (!navigator.getGamepads ||
            !options.gamepad.axes[axis]) return {x: 0, y: 0};

        var axes = options.gamepad.axes[axis];
        var adapt = function(value)
        {
            var border = {
                min: 0.1,
                max: 0.8
            }

            if (Math.abs(value) < border.min)
            {
                return 0;
            }
            else if (value > border.max)
            {
                return 1;
            }
            else if (value < -border.max)
            {
                return -1;
            }
            else if (value > 0)
            {
                return (value - border.min) / border.max;
            }
            else
            {
                return (value + border.min) / border.max;
            }
        };
        axes.x = adapt(axes.x);
        axes.y = adapt(axes.y);

        return axes;
    };

    var gamepad_poll = function(all)
    {
        var gamepad_update_status = function(gamepad)
        {
            options.gamepad.timestamp = gamepad.timestamp;

            // axes
            for (var i = 0; i <= (gamepad.axes.length / 2) - 1; i++)
            {
                options.gamepad.axes[i] = {
                    x: gamepad.axes[i * 2],
                    y: gamepad.axes[i * 2 + 1]
                };          
            }
        };

        var gamepad_axis_trigger = function(prev, cur, border, down, up)
        {
            if (
                (border > 0 && prev < border && cur >= border) ||
                (border < 0 && prev > border && cur <= border)
                )
            {
                down();
            }
            else if (
                     (border > 0 && prev >= border && cur < border) ||
                     (border < 0 && prev <= border && cur > border)
                    )
            {
                up();
            }
        };

        if (!navigator.getGamepads) return;
        var gamepad = navigator.getGamepads()[0];
        if (!gamepad || gamepad == undefined || gamepad.timestamp == options.gamepad.timestamp) return;

        if (all)
        {
            // buttons          
            $.each(gamepad.buttons, function(buttonIndex, button)
            {
                if (!options.gamepad.buttons[buttonIndex] && button.pressed)
                {
                    ondown({device: "gamepad", type: "button", code: buttonIndex});
                    button.pressed = false;
                }
                else if (options.gamepad.buttons[buttonIndex] && !button.pressed)
                {
                    onup({device: "gamepad", type: "button", code: buttonIndex});
                    button.pressed = true;
                }
            });

            // axes
            for (var i = 0; i <= options.gamepad.axes.length - 1; i++)
            {
                var prev = options.gamepad.axes[i];
                var cur  = {x: gamepad.axes[i * 2], y: gamepad.axes[i * 2 + 1]};

                var border = 0.5;
                gamepad_axis_trigger(prev.y, cur.y, border,
                                     function() { ondown({device: "gamepad", type: "axes-" + i, code: "0"}); },
                                     function() { onup(  {device: "gamepad", type: "axes-" + i, code: "0"}); }
                                     );
                gamepad_axis_trigger(prev.y, cur.y, -border,
                                     function() { ondown({device: "gamepad", type: "axes-" + i, code: "1"}); },
                                     function() { onup(  {device: "gamepad", type: "axes-" + i, code: "1"}); }
                                     );
                gamepad_axis_trigger(prev.x, cur.x,  border,
                                     function() { ondown({device: "gamepad", type: "axes-" + i, code: "2"}); },
                                     function() { onup(  {device: "gamepad", type: "axes-" + i, code: "2"}); }
                                     );
                gamepad_axis_trigger(prev.x, cur.x, -border,
                                     function() { ondown({device: "gamepad", type: "axes-" + i, code: "3"}); },
                                     function() { onup(  {device: "gamepad", type: "axes-" + i, code: "3"}); }
                                     );
            };

            // update gamepad
            gamepad_update_status(gamepad);
        }
        else
        {
            // commands
            $.each(DodgeIt.options.controls, function(index, control)
            {
                $.extend(control, options.command[index]);
                if (control.device == "gamepad")
                {
                    var down    = function() { ondown(control); };
                    var up      = function() { onup(control); };

                    if (control.type == "button")
                    {       
                        if (control.pressed != gamepad.buttons[control.code].pressed)
                        {
                            if (!control.pressed)
                            {
                                down();
                            }
                            else
                            {
                                up();
                            }
                        }
                    }
                    else if (control.type.match(/axes-\d/))
                    {
                        var axis_id = (/axes-(\d)/.exec(control.type))[1];
                        if (options.gamepad.axes[axis_id])
                        {
                            var border = (control.code % 2 == 0) ? 0.5 : -0.5;

                            var cur, prev;
                            if (control.code == 2 || control.code == 3)
                            {                         
                                prev = options.gamepad.axes[axis_id].x;           
                                cur  = gamepad.axes[axis_id * 2];
                            }
                            else
                            {
                                prev = options.gamepad.axes[axis_id].y;
                                cur  = gamepad.axes[axis_id * 2 + 1];
                            }
                            gamepad_axis_trigger(prev, cur, border, down, up);
                        }              
                    }
                }
            });

            // update status
            gamepad_update_status(gamepad);
        }
    };

    // orientation
    var orientation_axes = function()
    {
        if (!window.DeviceOrientationEvent) return {x: 0, y: 0};

        var x;
        x = options.orientation.gamma / 30;
        x = Math.min(1, x);
        x = Math.max(-1, x);

        var y;
        y = options.orientation.beta / 30;
        y = Math.min(1, y);
        y = Math.max(-1, y);
        
        return {x: x, y: y};
    };

    // axes
    var axes = function()
    {
        var output = {x: 0, y: 0};

        // gamepad
        output = gamepad_axes();

        // orientation
        if (output.x == 0 && output.y == 0)
        {
            output = orientation_axes();
        }

        return output;
    };

    // INIT
    // keydown
    $(document).keydown(function(event)
    { 
        if (!ondown({device: "keyboard", type: null, code: event.keyCode}))
        {
            event.preventDefault();
            return false;
        }
        else
        {
            return true;
        }
    });

    // keyup
    $(document).keyup(function(event)
    {
        if (!onup({device: "keyboard", type: null, code: event.keyCode}))
        {
            event.preventDefault();
            return false;
        }
        else
        {
            return true;
        }
    });

    // gamepad
    // navigator.getGamepads
    if (!navigator.getGamepads &&
        navigator.webkitGamepads)
    {
        navigator.getGamepads = navigator.webkitGamepads;
    }

    // poll
    gamepad_poll(true);

    // mobile - device orientation
    if (!!window.DeviceOrientationEvent)
    {
        window.addEventListener("deviceorientation", function(event)
        {
            options.orientation.beta  = event.beta;
            options.orientation.gamma = event.gamma;
        }, true);
    }

    // RETURN
    return {
        command:    command,
        format:     format,
        ondown:     ondown,
        onup:       onup,
        reset:      reset,
        set:        set,

        axes:   axes,
        gamepad: {
            axes:   gamepad_axes,
            axes_length: function() { return options.gamepad.axes.length; },
            poll:   gamepad_poll,
            available:  (!!navigator.getGamepads)
        },
        orientation: {
            axes:       orientation_axes,
            available:  (!!window.DeviceOrientationEvent)
        }
    };
})();