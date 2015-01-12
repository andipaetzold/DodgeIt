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
            code:       value,
            fn:         function() {},
            pressed:    false
        };
    });

    // keydown
    $(document).keydown(function(event)
    {
        if (that.controls.set.active == false)
        {
            $.each(that.controls.command, function(index, value)
            {
                if (event.keyCode == value.code)
                {
                    that.controls.command[index].pressed = true;
                    that.controls_command(index);
                    return false;
                }
            });          
        }
        else
        {
            // set control
            if (that.controls.set.abort != event.keyCode)
            {
                that.controls.command[that.controls.set.key].code = event.keyCode;
                that.controls.set.callback(event.keyCode);
            }
            else
            {
                that.controls.set.callback(null);
            }
            that.controls.set.active = false;

            return false;
        }
    });

    // keyup
    $(document).keyup(function(event)
    {        
        $.each(that.controls.command, function(index, value)
        {
            if (event.keyCode == value.code)
            {
                that.controls.command[index].pressed = false;
                return false;
            }
        });

        return true;
    });
};

DodgeIt.prototype.controls_reset = function()
{
    var that = this;
    $.each(this.controls.command, function(index, value)
    {
        // that.controls_command_set(index, function() {});
    });
}

DodgeIt.prototype.controls_set = function(key, callback)
{
    this.controls.set.key = key;
    this.controls.set.callback = callback;
    this.controls.set.active = true;
}

DodgeIt.prototype.controls_command = function(command)
{
    this.controls.command[command].fn();
}

DodgeIt.prototype.controls_command_set = function(command, fn)
{
    this.controls.command[command].fn = fn;
}

DodgeIt.prototype.controls_keyName = function(key)
{
    var keycodes = {
        37:     "left",
        38:     "up",
        39:     "right",
        40:     "down",
        45:     "insert",
        46:     "delete",
        8:      "backspace",
        9:      "tab",
        13:     "enter",
        16:     "shift",
        17:     "ctrl",
        18:     "alt",
        19:     "pause",
        20:     "capslock",
        27:     "escape",
        32:     "space",
        33:     "pageup",
        34:     "pagedown",
        35:     "end",
        36:     "home",
        112:    "f1",
        113:    "f2",
        114:    "f3",
        115:    "f4",
        116:    "f5",
        117:    "f6",
        118:    "f7",
        119:    "f8",
        120:    "f9",
        121:    "f10",
        122:    "f11",
        123:    "f12",
        144:    "numlock",
        145:    "scrolllock",
        186:    "semicolon",
        187:    "equal",
        188:    "comma",
        189:    "dash",
        190:    "period",
        191:    "slash",
        192:    "graveaccent",
        219:    "openbracket",
        220:    "backslash",
        221:    "closebraket",
        222:    "singlequote"
    };

    if (key >= 48 && key <= 90)
    {
        return String.fromCharCode(e.which).toLowerCase();   
    } 
    else
    {
        return keycodes[key];
    }
}