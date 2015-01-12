DodgeIt.prototype.controls_init = function()
{
    this.options.controls.command["up"]    =   38;
    this.options.controls.command["down"]  =   40;
    this.options.controls.command["left"]  =   37;
    this.options.controls.command["right"] =   39;
    this.options.controls.command["enter"] =   13;
    this.options.controls.command["back"]  =    8;

    var that = this;
    $(document).keydown(function(event)
    {
        if (that.options.controls.set.active == false)
        {
            switch(event.keyCode)
            {
                case that.options.controls.command["up"]:     // top
                    that.controls_top();
                    break;
                case that.options.controls.command["down"]:    // down
                    that.controls_down();
                    break;
                case that.options.controls.command["left"]:    // left
                    that.controls_left();
                    break;
                case that.options.controls.command["right"]:   // right
                    that.controls_right();
                    break;
                case that.options.controls.command["enter"]:   // enter
                    that.controls_enter();
                    break;
                case that.options.controls.command["back"]:    // back
                    that.controls_back();
                    break;
                default:
                    return true;
            }            
        }
        else
        {
            // set control
            if (that.options.controls.set.abort != event.keyCode)
            {
                that.options.controls.command[that.options.controls.set.key] = event.keyCode;
                that.options.controls.set.callback(event.keyCode);
            }
            else
            {
                that.options.controls.set.callback(null);
            }
            that.options.controls.set.active = false;
        }

        return false;
    });
};

DodgeIt.prototype.controls_reset = function()
{
    DodgeIt.prototype.controls_back    = function() {};
    DodgeIt.prototype.controls_enter   = function() {};
    DodgeIt.prototype.controls_left    = function() {};
    DodgeIt.prototype.controls_top     = function() {};
    DodgeIt.prototype.controls_right   = function() {};
    DodgeIt.prototype.controls_down    = function() {};
}

DodgeIt.prototype.controls_set = function(key, callback)
{
    this.options.controls.set.key = key;
    this.options.controls.set.callback = callback;
    this.options.controls.set.active = true;
}