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