DodgeIt.prototype.controls_init = function()
{
    var that = this;

    // set this.controls
    this.controls = {
        command:    {},
        gamepad: {
            index:      null,
            buttons:    [],
            axes:       [],
            axes_selected: 0
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

            device:     "keyboard",
            type:       null, // gamepad: button or stick
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

DodgeIt.prototype.controls_axes = function()
{
    if (this.controls.gamepad.index != null &&
        this.controls.gamepad.axes[this.controls.gamepad.axes_selected])
    {
        var axes = this.controls.gamepad.axes[this.controls.gamepad.axes_selected];

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

    var gamepad_parseaxes = function(axes)
    {
        var output = []
        $.each(axes, function(index, value)
        {
            if (index % 2 == 0)
            {
                output.push({x: value, y: 0});
            }
            else
            {
                output[(index - 1) / 2].y = value;
            }
        });
        return output;
    }

    var gamepad_update_status = function(gamepad)
    {
        that.controls.gamepad.index = gamepad.index;

        // buttons
        that.controls.gamepad.buttons = [];
        $.each(gamepad.buttons, function(buttonIndex, button)
        {
            that.controls.gamepad.buttons[buttonIndex] = button.pressed;
        });

        // axes
        that.controls.gamepad.axes = gamepad_parseaxes(gamepad.axes);
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

    var gamepads = navigator.getGamepads();
    if (gamepads.length >= 1 &&
        gamepads[0] != undefined)
    {
        var gamepad = gamepads[0];

        if (this.controls.gamepad.index != null)
        {
            if (poll_all)
            {
                // buttons
                $.each(gamepad.buttons, function(buttonIndex, button)
                {
                    if (!that.controls.gamepad.buttons[buttonIndex] && button.pressed)
                    {
                        that.controls_down({device: "gamepad", type: "button", code: buttonIndex});
                    }
                    else if (that.controls.gamepad.buttons[buttonIndex] && !button.pressed)
                    {
                        that.controls_up({device: "gamepad", type: "button", code: buttonIndex});
                    }
                });

                // axes
                $.each(gamepad_parseaxes(gamepad.axes), function(index, value)
                {
                    var prev = that.controls.gamepad.axes[index];

                    var border = 0.5;
                    gamepad_axis_trigger(prev.y, value.y, border,
                                         function() { that.controls_down({device: "gamepad", type: "axes-" + index, code: "0"}); },
                                         function() { that.controls_up({device: "gamepad", type: "axes-" + index, code: "0"}); }
                                         );
                    gamepad_axis_trigger(prev.y, value.y, -border,
                                         function() { that.controls_down({device: "gamepad", type: "axes-" + index, code: "1"}); },
                                         function() { that.controls_up({device: "gamepad", type: "axes-" + index, code: "1"}); }
                                         );
                    gamepad_axis_trigger(prev.x, value.x,  border,
                                         function() { that.controls_down({device: "gamepad", type: "axes-" + index, code: "2"}); },
                                         function() { that.controls_up({device: "gamepad", type: "axes-" + index, code: "2"}); }
                                         );
                    gamepad_axis_trigger(prev.x, value.x, -border,
                                         function() { that.controls_down({device: "gamepad", type: "axes-" + index, code: "3"}); },
                                         function() { that.controls_up({device: "gamepad", type: "axes-" + index, code: "3"}); }
                                         );
                });

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
                        if (command.type == "button")
                        {       
                            if (!command.pressed && gamepad.buttons[command.code].pressed)
                            {
                                command.fn();
                                command.pressed = true;
                            }
                            else if (command.pressed && !gamepad.buttons[command.code].pressed)
                            {
                                command.pressed = false;
                            }
                        }
                        else if(command.type.match(/axes-\d/))
                        {
                            var axe_id = (/axes-(\d)/.exec(command.type))[1];
                            if (that.controls.gamepad.axes[axe_id])
                            {
                                var border = 0.5;
                                if (command.code == 1 ||
                                    command.code == 3)
                                {
                                    border = -border;
                                }

                                var cur, prev;
                                if (command.code == 0 || command.code == 1)
                                {                         
                                    prev = that.controls.gamepad.axes[axe_id].y;           
                                    cur = gamepad_parseaxes(gamepad.axes)[axe_id].y;
                                }
                                else
                                {
                                    prev = that.controls.gamepad.axes[axe_id].y;
                                    cur = gamepad_parseaxes(gamepad.axes)[axe_id].x;
                                }

                                gamepad_axis_trigger(prev, cur, border,
                                                     function() { command.pressed = true; command.fn(); },
                                                     function() { command.pressed = false; }
                                                     );

                            }                  
                        }
                    }
                });

                // gamepad movement
                if (this.controls.gamepad.axes[this.controls.gamepad.axes_selected])
                {
                    that.controls.gamepad.axes = gamepad_parseaxes(gamepad.axes);
                }
            }
        }
        else
        {
            gamepad_update_status(gamepad);
        }
    }
    else
    {
        this.controls.gamepad.index = null;
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