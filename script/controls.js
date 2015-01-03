DodgeIt.prototype.controls_init = function()
{
    var that = this;
    $(document).keydown(function(event)
    {
        switch(event.key)
        {
            case "Backspace":
                that.controls_back();
                break;
            case "Enter":
            case " ":
                that.controls_enter();
                break;
            case "Left":
                that.controls_left();
                break;
            case "Top":
                that.controls_top();
                break;
            case "Right":
                that.controls_right();
                break;
            case "Down":
                that.controls_down();
                break;
            default:
                return true;
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