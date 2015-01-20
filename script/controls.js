DodgeIt.prototype.controls_init = function()
{
    var that = this;

    // set this.controls
    this.controls = {
        command:    {},
        gamepad: {
            buttons:    [],
            axes:       [],

            axes_selected: 0,
            timestamp: 0,
        },

        orientation: {
            beta:   null,
            gamma:  null
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
    }

    // default keys
    var keys = {
        "up":       38,
        "down":     40,
        "left":     37,
        "right":    39,
        "enter":    13,
        "back":     8
    }

    $.each(keys, function(index, value)
    {
        that.controls.command[index] = {
            fn: function() {},

            device:     "keyboard", // keyboard or gamepad
            type:       null,       // gamepad: button or stick
            code:       value,
            pressed:    false
        };
    });

    // keydown
    $(document).keydown(function(event)
    {
        var preventDefault = that.controls_down({device: "keyboard", type: null, code: event.keyCode});    
        if (!preventDefault)
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
        var preventDefault = that.controls_up({device: "keyboard", type: null, code: event.keyCode});
        if (!preventDefault)
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
    if (!navigator.getGamepads)
    {
        navigator.getGamepads = function()
        {
            return (navigator.webkitGamepads) ? navigator.webkitGamepads : (function() { return []; });
        };
    }

    // poll
    this.controls_gamepad_poll(true);

    // mobile - device orientation
    window.addEventListener("deviceorientation", function(event)
    {
        that.controls.orientation.beta  = event.beta;
        that.controls.orientation.gamma = event.gamma;
    }, true);
};

DodgeIt.prototype.controls_reset = function()
{
    var that = this;
    $.each(this.controls.command, function(index, value)
    {
        that.controls_command_set(index, function() {});
    });
};

DodgeIt.prototype.controls_set = function(key, callback)
{
    this.controls.set.key = key;
    this.controls.set.callback = callback;
    this.controls.set.active = true;
};

DodgeIt.prototype.controls_command = function(command)
{
    this.controls.command[command].fn();
};

DodgeIt.prototype.controls_command_set = function(command, fn)
{
    this.controls.command[command].fn = fn;
};

DodgeIt.prototype.controls_pressed = function(command)
{
    return (this.controls.command[command].pressed);
};

DodgeIt.prototype.controls_axes = function(axis)
{
    // axes default = this.controls.axes_selected
    if (axis == undefined)
    {
        axis = this.controls.gamepad.axes_selected;
    }

    var gamepad = navigator.getGamepads()[0];
    if (gamepad && gamepad != undefined &&
        gamepad.axes[axis * 2] &&
        gamepad.axes[(axis * 2) + 1])
    {
        var axes = {
            x: gamepad.axes[axis * 2],
            y: gamepad.axes[(axis * 2) + 1]
        };

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
    }
    else if (this.controls.orientation.beta != null && this.controls.orientation.gamma != null)
    {
        var x;
        x = this.controls.orientation.gamma / 45;
        x = Math.min(1, x);
        x = Math.max(-1, x);

        var y;
        y = this.controls.orientation.beta / 45;
        y = Math.min(1, y);
        y = Math.max(-1, y);

        return {x: x, y: y};
    }
    else
    {
        return {x: 0, y: 0};
    }
};

DodgeIt.prototype.controls_format = function(control)
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

DodgeIt.prototype.controls_gamepad_poll = function(poll_all)
{
    var that = this;

    var gamepad_update_status = function(gamepad)
    {
        that.controls.gamepad.timestamp = gamepad.timestamp;

        // axes
        for (var i = 0; i <= (gamepad.axes.length / 2) - 1; i++)
        {
            that.controls.gamepad.axes[i] = that.controls_axes(i);            
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

    var gamepad = navigator.getGamepads()[0];
    if (gamepad && gamepad != undefined &&
        gamepad.timestamp != this.controls.gamepad.timestamp)
    {        
        if (poll_all)
        {
            // buttons            
            $.each(gamepad.buttons, function(buttonIndex, button)
            {
                if (!that.controls.gamepad.buttons[buttonIndex] && button.pressed)
                {
                    that.controls_down({device: "gamepad", type: "button", code: buttonIndex});
                    button.pressed = false;
                }
                else if (that.controls.gamepad.buttons[buttonIndex] && !button.pressed)
                {
                    that.controls_up({device: "gamepad", type: "button", code: buttonIndex});
                    button.pressed = true;
                }
            });

            // axes
            for (var i = 0; i <= (that.controls.gamepad.axes.length / 2) - 1; i++)
            {
                var prev = that.controls.gamepad.axes[i];
                var cur  = that.controls_axes(i);

                var border = 0.5;
                gamepad_axis_trigger(prev.y, cur.y, border,
                                     function() { that.controls_down({device: "gamepad", type: "axes-" + i, code: "0"}); },
                                     function() { that.controls_up(  {device: "gamepad", type: "axes-" + i, code: "0"}); }
                                     );
                gamepad_axis_trigger(prev.y, cur.y, -border,
                                     function() { that.controls_down({device: "gamepad", type: "axes-" + i, code: "1"}); },
                                     function() { that.controls_up(  {device: "gamepad", type: "axes-" + i, code: "1"}); }
                                     );
                gamepad_axis_trigger(prev.x, cur.x,  border,
                                     function() { that.controls_down({device: "gamepad", type: "axes-" + i, code: "2"}); },
                                     function() { that.controls_up(  {device: "gamepad", type: "axes-" + i, code: "2"}); }
                                     );
                gamepad_axis_trigger(prev.x, cur.x, -border,
                                     function() { that.controls_down({device: "gamepad", type: "axes-" + i, code: "3"}); },
                                     function() { that.controls_up(  {device: "gamepad", type: "axes-" + i, code: "3"}); }
                                     );
            };

            // update gamepad
            gamepad_update_status(gamepad);
        }
        else
        {
            // commands
            $.each(this.controls.command, function(commandIndex, command)
            {
                if (command.device == "gamepad")
                {
                    var down = function()
                    {
                        command.fn();
                        command.pressed = true;
                    };

                    var up = function()
                    {
                        command.pressed = false;
                    };

                    if (command.type == "button")
                    {       
                        if (command.pressed != gamepad.buttons[command.code].pressed)
                        {
                            if (!command.pressed)
                            {
                                down();
                            }
                            else
                            {
                                up();
                            }
                        }
                    }
                    else if (command.type.match(/axes-\d/))
                    {
                        var axis_id = (/axes-(\d)/.exec(command.type))[1];
                        if (that.controls.gamepad.axes[axis_id])
                        {
                            var border = (command.code % 2 == 0) ? 0.5 : -0.5;

                            var cur, prev;
                            if (command.code == 2 || command.code == 3)
                            {                         
                                prev = that.controls.gamepad.axes[axis_id].x;           
                                cur  = that.controls_axes(axis_id).x;

                                that.controls.gamepad.axes[axis_id].x = cur;
                            }
                            else
                            {
                                prev = that.controls.gamepad.axes[axis_id].y;
                                cur  = that.controls_axes(axis_id).y;

                                that.controls.gamepad.axes[axis_id].y = cur;
                            }

                            gamepad_axis_trigger(prev, cur, border, down, up);
                        }              
                    }
                }
            });
        }
    }
}

// controls up / down
DodgeIt.prototype.controls_up = function(control)
{
    $.each(this.controls.command, function(commandIndex, command)
    {
        if (command.device == control.device &&
            command.type   == control.type &&
            command.code   == control.code)
        {
            command.pressed = false;
            return false;
        }
    });

    return true;
};

DodgeIt.prototype.controls_down = function(control)
{
    if (!this.controls.set.active)
    {
        $.each(this.controls.command, function(commandIndex, command)
        {
            if (command.device == control.device &&
                command.type   == control.type &&
                command.code   == control.code)
            {
                command.pressed = true;
                command.fn();
                return false;
            }
        });
        return true;
    }
    else
    {
        // set control
        if (this.controls.set.abort.device != control.device ||
            this.controls.set.abort.type   != control.type ||
            this.controls.set.abort.code   != control.code)
        {
            this.controls.command[this.controls.set.key].device = control.device;
            this.controls.command[this.controls.set.key].type   = control.type;
            this.controls.command[this.controls.set.key].code   = control.code;
            this.controls.set.callback(control);
        }
        else
        {
            this.controls.set.callback(null);
        }
        this.controls.set.active = false;

        return false;
    }

};