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

    if (key >= 48 && key <= 90)
    {
        return String.fromCharCode(e.which).toLowerCase();   
    } 
    else
    {
        return keycodes[key];
    }
}