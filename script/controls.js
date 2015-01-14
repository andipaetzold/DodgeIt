DodgeIt.prototype.controls_init = function()
{
    var that = this;

    // set this.controls

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
        var preventDefault = control_down({device: "keyboard", type: null, code: event.keyCode});    
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
        var preventDefault = control_up({device: "keyboard", type: null, code: event.keyCode});
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
    if (navigator.getGamepads)
    {
        var gamepad_polling = false;

        // window.requestAnimationFrame         
        if (!window.requestAnimationFrame)
        {
            window.requestAnimationFrame = (function()
            {
                return window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame ||
                       window.oRequestAnimationFrame ||
                       window.msRequestAnimationFrame ||
                       function(callback, element)
                       {
                          window.setTimeout(callback, 1000 / 60);
                       };
            })();
        } 

        // navigator.getGamepads
        if (!navigator.getGamepads)
        {
            navigator.getGamepads = (function()
            {
                return navigator.webkitGetGamepads() ||
                       function()
                       {
                          return [];
                       };
            });
        }

        // update
        $(window).on("gamepadconnected", function(event)
        {
            if (navigator.getGamepads().length == 1)
            {
                gamepad_update_status(navigator.getGamepads()[0]);
            }

            if (!gamepad_polling)
            {
                gamepad_polling = true;
                window.requestAnimationFrame(gamepad_poll);
            }
        });

        $(window).on("gamepaddisconnected", function(event)
        {
            if (navigator.getGamepads().length == 0)
            {
                gamepad_polling = false;
                that.controls.gamepad.index = null;
            }
        });

        // poll
        var gamepad_poll = function()
        {
            var gamepads = navigator.getGamepads();
            if (gamepads.length >= 1)
            {
                var gamepad = gamepads[0];
                $.each(gamepad.buttons, function(buttonIndex, button)
                {
                    if (!that.controls.gamepad.buttons[buttonIndex] && button.pressed)
                    {
                        control_down({device: "gamepad", type: "button", code: buttonIndex});
                    }
                    else if (that.controls.gamepad.buttons[buttonIndex] && !button.pressed)
                    {
                        control_up({device: "gamepad", type: "button", code: buttonIndex});
                    }
                });

                // update gamepad status
                gamepad_update_status(gamepad);
            }

            // next poll
            window.requestAnimationFrame(gamepad_poll);
        };

        var gamepad_update_status = function(gamepad)
        {
            that.controls.gamepad.index = gamepad.index;
            that.controls.gamepad.buttons = [];
            $.each(gamepad.buttons, function(buttonIndex, button)
            {
                that.controls.gamepad.buttons[buttonIndex] = button.pressed;
            });
        };
    }

    // controls up / down
    var control_up = function(control)
    {
        $.each(that.controls.command, function(commandIndex, command)
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

    var control_down = function(control)
    {
        if (!that.controls.set.active)
        {
            $.each(that.controls.command, function(commandIndex, command)
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
            if (that.controls.set.abort.device != control.device ||
                that.controls.set.abort.type   != control.type ||
                that.controls.set.abort.code   != control.code)
            {
                that.controls.command[that.controls.set.key].device = control.device;
                that.controls.command[that.controls.set.key].type   = control.type;
                that.controls.command[that.controls.set.key].code   = control.code;
                that.controls.set.callback(control);
            }
            else
            {
                that.controls.set.callback(null);
            }
            that.controls.set.active = false;

            return false;
        }

    };
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
            return "Keyboard " + String.fromCharCode(e.which).toLowerCase();   
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
    else
    {
        return "";
    }
};